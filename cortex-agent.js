/* ================================================
   CORTEX AGENT — retrieval engine
   Answers questions from CORTEX_KB and from Jeevan's
   public GitHub (repo list + READMEs, fetched live).
   BM25 ranking, no language model: if a fact is not in
   a source, Cortex says so instead of guessing.

   ask(question) -> Promise<{
     text, source: {label, href?}, actions: [{label, kind, value}], chips: [string]
   }>
   action kinds: scroll | open | copy | focus | ask
   ================================================ */

(function (root) {
    'use strict';

    const KB = root.CORTEX_KB;
    if (!KB) return;
    const USER = KB.owner.github;
    const GH = 'https://github.com/' + USER;

    // ---------- text utils ----------

    const STOP = new Set(('a an the and or but of to in on for with at by from is are was were be been being it its this that these those ' +
        'i me my you your he him his she her they them their we us our what which who whom how why when where do does did done can could ' +
        'would should will shall may might must have has had any some about tell show give list please there here than then so just also ' +
        'more most very much many really get got make made use used using know want like into out up down over all each other such only own same ' +
        'jeevan raj jeevans s hi hey hello').split(' '));

    function stem(w) {
        if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
        if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
        if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2);
        if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
        return w;
    }

    function tokens(text) {
        return (text || '').toLowerCase()
            .replace(/[’']/g, '')
            .split(/[^a-z0-9.+#]+/)
            .map(t => t.replace(/^\.+|\.+$/g, ''))
            .filter(t => t && !STOP.has(t))
            .map(stem);
    }

    function norm(q) {
        return ' ' + q.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9.+#&/ -]+/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
    }

    function hasPhrase(nq, phrase) {
        return nq.includes(' ' + phrase + ' ');
    }

    // ---------- BM25 ----------

    function buildIndex(docs, fieldFn) {
        const N = docs.length;
        const df = new Map();
        const items = docs.map(doc => {
            const toks = fieldFn(doc);
            const tf = new Map();
            toks.forEach(t => tf.set(t, (tf.get(t) || 0) + 1));
            tf.forEach((_, t) => df.set(t, (df.get(t) || 0) + 1));
            return { doc, tf, len: toks.length };
        });
        const avg = items.reduce((s, it) => s + it.len, 0) / Math.max(1, N);
        return { N, df, items, avg };
    }

    function search(index, query, k1 = 1.2, b = 0.75) {
        const q = [...new Set(tokens(query))];
        if (!q.length) return [];
        return index.items.map(it => {
            let score = 0, hits = 0;
            q.forEach(t => {
                const f = it.tf.get(t);
                if (!f) return;
                hits++;
                const n = index.df.get(t) || 0;
                const idf = Math.log(1 + (index.N - n + 0.5) / (n + 0.5));
                score += idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * it.len / index.avg));
            });
            return { doc: it.doc, score, hits };
        }).filter(r => r.score > 0).sort((a, b2) => b2.score - a.score);
    }

    // ---------- knowledge index ----------

    const projectById = Object.fromEntries(KB.projects.map(p => [p.id, p]));

    const kbDocs = KB.docs.map(d => Object.assign({ kind: 'doc' }, d)).concat(KB.projects.map(p => ({
        kind: 'project', id: 'project:' + p.id, project: p, title: p.name, section: 'projects',
        keywords: p.aliases.join(' ') + ' ' + p.domains.map(d => KB.domains[d].words.join(' ')).join(' ') +
            ' project' + (p.id === 'lumina' ? ' featured best flagship strongest favourite favorite' : ''),
        text: p.summary + ' ' + p.result + ' Stack: ' + p.stack.join(', ') + '.'
    })));

    const kbIndex = buildIndex(kbDocs, d => {
        const kw = tokens(d.keywords || '');
        return tokens(d.title).concat(kw, kw, tokens(d.text));
    });

    // ---------- live GitHub ----------

    const cache = {
        get(key, maxAgeMs) {
            try {
                const raw = sessionStorage.getItem('cortex:' + key);
                if (!raw) return null;
                const { t, v } = JSON.parse(raw);
                return Date.now() - t < maxAgeMs ? v : null;
            } catch { return null; }
        },
        set(key, v) {
            try { sessionStorage.setItem('cortex:' + key, JSON.stringify({ t: Date.now(), v })); } catch {}
        }
    };

    async function fetchRepos() {
        const hit = cache.get('repos', 10 * 60 * 1000);
        if (hit) return hit;
        const res = await fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`, {
            headers: { Accept: 'application/vnd.github+json' }
        });
        if (!res.ok) throw new Error(res.status === 403 ? 'rate' : 'http ' + res.status);
        const data = (await res.json()).filter(r => !r.fork).map(r => ({
            name: r.name, url: r.html_url, description: r.description, language: r.language,
            stars: r.stargazers_count, pushed: r.pushed_at, created: r.created_at
        }));
        cache.set('repos', data);
        return data;
    }

    function stripMarkdown(md) {
        return md
            .replace(/<!--[\s\S]*?-->/g, '')
            .replace(/<[^>]+>/g, '')
            .replace(/!\[[^\]]*]\([^)]*\)/g, '')
            .replace(/\[([^\]]*)]\([^)]*\)/g, '$1')
            .replace(/^\s*\|?\s*:?-{3,}.*$/gm, '')
            .replace(/[*_`]{1,3}([^*_`\n]+)[*_`]{1,3}/g, '$1')
            .replace(/^>\s?/gm, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    function slug(h) {
        return h.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    }

    async function fetchReadmeChunks(project) {
        const key = 'readme:' + project.repo;
        let chunks = cache.get(key, 30 * 60 * 1000);
        if (chunks) return chunks;
        const url = `https://raw.githubusercontent.com/${USER}/${project.repo}/${project.branch}/README.md`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('http ' + res.status);
        const md = (await res.text()).replace(/```mermaid[\s\S]*?```/g, '').replace(/```[\s\S]*?```/g, m => m.length > 700 ? '' : m.replace(/```\w*/g, ''));
        chunks = [];
        let cur = { heading: project.name, body: [] };
        md.split('\n').forEach(line => {
            const m = /^(#{1,4})\s+(.+?)\s*#*\s*$/.exec(line);
            if (m) {
                if (cur.body.join('').trim()) chunks.push(cur);
                cur = { heading: m[2].replace(/[*_`]/g, '').trim(), body: [] };
            } else {
                cur.body.push(line);
            }
        });
        if (cur.body.join('').trim()) chunks.push(cur);
        chunks = chunks.map(c => ({ heading: c.heading, text: stripMarkdown(c.body.join('\n')) }))
            .filter(c => c.text.length > 40 && !/^(table of )?contents$/i.test(c.heading));
        cache.set(key, chunks);
        return chunks;
    }

    function trimTo(text, max) {
        if (text.length <= max) return text;
        const cut = text.slice(0, max);
        const stop = Math.max(cut.lastIndexOf('\n'), cut.lastIndexOf('. '));
        return (stop > max * 0.5 ? cut.slice(0, stop + 1) : cut) .trim() + ' …';
    }

    function ago(iso) {
        const diff = (new Date(iso) - Date.now()) / 1000;
        const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
        const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
        for (const [u, s] of units) if (Math.abs(diff) >= s) return rtf.format(Math.round(diff / s), u);
        return 'just now';
    }

    // ---------- answer builders ----------

    const SUGGESTED = ['Show me your RAG work', 'Best project?', 'What are you working on lately?', 'Data science projects', 'How do I contact Jeevan?'];

    function repoUrl(p) { return `${GH}/${p.repo}`; }

    function projectAnswer(p) {
        return {
            text: `${p.name}\n\n${p.summary}\n\nResult: ${p.result}\n\nStack: ${p.stack.join(' · ')}`,
            source: { label: 'Projects section', href: '#projects' },
            actions: [
                { label: 'Show on page', kind: 'focus', value: [p.id] },
                { label: 'Open repo', kind: 'open', value: repoUrl(p) },
                { label: 'How does it work?', kind: 'ask', value: `How does ${p.name} work?` }
            ],
            chips: [`How was ${p.name} tested?`, 'Show me another project']
        };
    }

    function matchProjects(nq) {
        return KB.projects.filter(p => [p.name.toLowerCase(), p.repo.toLowerCase()].concat(p.aliases).some(a => hasPhrase(nq, a)));
    }

    function matchDomains(nq) {
        return Object.entries(KB.domains)
            .filter(([, d]) => d.words.some(w => hasPhrase(nq, w)))
            .map(([id]) => id);
    }

    function domainAnswer(ids) {
        const labels = ids.map(id => KB.domains[id].label);
        const projects = KB.projects
            .map(p => ({ p, n: p.domains.filter(d => ids.includes(d)).length }))
            .filter(x => x.n > 0)
            .sort((a, b) => b.n - a.n)
            .map(x => x.p);
        const exp = KB.docs.filter(d => d.section === 'experience' &&
            ids.some(id => KB.domains[id].words.some(w => (' ' + d.keywords + ' ' + d.text.toLowerCase() + ' ').includes(' ' + w + ' '))));
        if (!projects.length && !exp.length) {
            return {
                text: `Nothing on record for ${labels.join(' / ')}. I won't dress up other work to fit.`,
                source: { label: 'Knowledge index' }, actions: [], chips: ['What domains does Jeevan work in?']
            };
        }
        const count = n => ['zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'][n] || String(n);
        let text = `${labels.join(' + ')}. ${count(projects.length)} project${projects.length === 1 ? '' : 's'}` +
            (exp.length ? `, ${count(exp.length).toLowerCase()} internship${exp.length === 1 ? '' : 's'}` : '') + ' on record:\n';
        projects.forEach(p => { text += `\n▸ ${p.name}\n  ${p.hook}\n`; });
        exp.forEach(d => { text += `\n▸ ${d.title}\n`; });
        const actions = [{ label: 'Show on page', kind: 'focus', value: projects.map(p => p.id) }];
        projects.slice(0, 2).forEach(p => actions.push({ label: p.name, kind: 'ask', value: `Tell me about ${p.name}` }));
        const others = Object.keys(KB.domains).filter(d => !ids.includes(d) && KB.projects.some(p => p.domains.includes(d)));
        return {
            text: text.trim(),
            source: { label: 'Projects + experience', href: '#projects' },
            actions,
            chips: others.slice(0, 3).map(d => `Show me ${KB.domains[d].label} work`)
        };
    }

    function domainsOverview() {
        const rows = Object.entries(KB.domains)
            .map(([id, d]) => ({ label: d.label, n: KB.projects.filter(p => p.domains.includes(id)).length }))
            .filter(r => r.n).sort((a, b) => b.n - a.n);
        return {
            text: 'Coverage across Jeevan\'s public work, projects per domain:\n\n' +
                rows.map(r => `▸ ${r.label.padEnd(22)} ${'■'.repeat(r.n)} ${r.n}`).join('\n'),
            source: { label: 'Project tags in my index' },
            actions: [],
            chips: rows.slice(0, 4).map(r => `Show me ${r.label} work`)
        };
    }

    async function readmeAnswer(p, question) {
        let chunks;
        try { chunks = await fetchReadmeChunks(p); }
        catch {
            const a = projectAnswer(p);
            a.text = `GitHub isn't responding. Here is what I hold locally:\n\n` + a.text;
            return a;
        }
        const own = new Set(tokens([p.name, p.repo].concat(p.aliases).join(' ')));
        const q = tokens(question).filter(t => !own.has(t)).join(' ');
        const idx = buildIndex(chunks, c => tokens(c.heading).concat(tokens(c.heading), tokens(c.text)));
        let hits = q ? search(idx, q) : [];
        const fallbackOrder = /test|eval|metric|result|accura|score|f1|iou/.test(question.toLowerCase())
            ? ['result', 'evaluation', 'test'] : ['architecture', 'how it works', 'overview', 'pipeline', 'features'];
        let best = hits[0] && hits[0].doc;
        if (!best) best = chunks.find(c => fallbackOrder.some(h => c.heading.toLowerCase().includes(h))) || chunks[0];
        if (!best) return projectAnswer(p);
        return {
            text: `Pulled live from the ${p.name} README, section "${best.heading}":\n\n${trimTo(best.text, 650)}`,
            source: { label: `${p.repo}/README.md`, href: `${repoUrl(p)}#${slug(best.heading)}` },
            actions: [
                { label: 'Read full README', kind: 'open', value: `${repoUrl(p)}#readme` },
                { label: 'Show on page', kind: 'focus', value: [p.id] }
            ],
            chips: [`What did ${p.name} achieve?`, `What stack does ${p.name} use?`]
        };
    }

    async function githubAnswer(nq) {
        let repos;
        try { repos = await fetchRepos(); }
        catch (e) {
            return {
                text: e.message === 'rate'
                    ? 'GitHub\'s rate limit is maxed out for your network. Live data is offline for now. The profile itself is one click away.'
                    : 'GitHub isn\'t responding. Try again in a moment.',
                source: { label: 'api.github.com' },
                actions: [{ label: 'Open GitHub profile', kind: 'open', value: GH }], chips: []
            };
        }
        const src = { label: `api.github.com · live · ${repos.length} public repos`, href: GH + '?tab=repositories' };
        if (/ star/.test(nq)) {
            const total = repos.reduce((s, r) => s + r.stars, 0);
            const top = repos.filter(r => r.stars).sort((a, b) => b.stars - a.stars).slice(0, 3);
            return {
                text: `Live from GitHub: ${total} star${total === 1 ? '' : 's'} across ${repos.length} public repos.` +
                    (top.length ? '\n\n' + top.map(r => `▸ ${r.name} — ★ ${r.stars}`).join('\n') : ''),
                source: src, actions: [{ label: 'Open GitHub', kind: 'open', value: GH }], chips: ['What are you working on lately?']
            };
        }
        if (/ language/.test(nq)) {
            const counts = {};
            repos.forEach(r => { if (r.language) counts[r.language] = (counts[r.language] || 0) + 1; });
            const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]);
            return {
                text: 'Language breakdown, live from GitHub (main language per repo):\n\n' + rows.map(([l, n]) => `▸ ${l.padEnd(18)} ${n}`).join('\n'),
                source: src, actions: [], chips: ['What skills does Jeevan have?']
            };
        }
        if (/ how many | count | number of /.test(nq)) {
            return {
                text: `${repos.length} public repositories on record (forks excluded):\n\n` + repos.map(r => `▸ ${r.name}`).join('\n'),
                source: src, actions: [{ label: 'Open repositories', kind: 'open', value: GH + '?tab=repositories' }], chips: []
            };
        }
        const meta = new Set([USER.toLowerCase(), (USER + '.github.io').toLowerCase()]);
        const recent = repos.filter(r => !meta.has(r.name.toLowerCase())).slice(0, 4);
        return {
            text: 'Live from GitHub. Latest activity:\n\n' + recent.map(r => {
                const p = KB.projects.find(x => x.repo.toLowerCase() === r.name.toLowerCase());
                return `▸ ${p ? p.name : r.name} — ${ago(r.pushed)}` + (p ? `\n  ${p.hook}` : (r.description ? `\n  ${trimTo(r.description, 90)}` : ''));
            }).join('\n'),
            source: src,
            actions: recent.slice(0, 2).map(r => ({ label: r.name, kind: 'open', value: r.url })),
            chips: ['How many stars?', 'Which languages?']
        };
    }

    function ownerLinks() {
        return [
            { label: 'Copy email', kind: 'copy', value: KB.owner.email },
            { label: 'Email', kind: 'open', value: 'mailto:' + KB.owner.email },
            { label: 'LinkedIn', kind: 'open', value: KB.owner.linkedin }
        ];
    }

    function docAnswer(d, related) {
        const actions = [];
        if (d.section) actions.push({ label: 'Go to ' + d.section, kind: 'scroll', value: d.section });
        if (d.projectRef) actions.push({ label: 'Show on page', kind: 'focus', value: [d.projectRef] });
        if (d.section === 'contact') actions.unshift(...ownerLinks());
        return {
            text: d.text,
            source: { label: d.title + (d.section ? ` · #${d.section}` : ''), href: d.section ? '#' + d.section : undefined },
            actions,
            chips: related ? [related] : []
        };
    }

    // ---------- skill evidence lookup ----------

    const skillsDoc = KB.docs.find(d => d.id === 'skills');
    const SKILL_SOURCES = [{ where: 'Skills section', text: skillsDoc.text, list: skillsDoc.text.split('\n').flatMap(l => l.replace(/^[^:]+:/, '').split(',')).map(x => x.replace(/\(.*?\)/g, '').replace(/\.$/, '').trim()) }]
        .concat(KB.projects.map(p => ({ where: p.name, text: p.summary + ' ' + p.stack.join(' '), list: p.stack, project: p })))
        .concat(KB.docs.filter(d => d.section === 'experience').map(d => ({ where: d.title, text: d.text, list: [] })));
    const SKILL_VOCAB = [...new Set(SKILL_SOURCES.flatMap(s => s.list).map(x => x.toLowerCase()).filter(Boolean))]
        .concat(['tensorflow', 'keras', 'kubernetes', 'aws', 'azure', 'gcp', 'java', 'javascript', 'typescript', 'c++', 'r', 'spark', 'hadoop', 'tableau', 'power bi', 'excel', 'mongodb', 'mysql', 'langchain', 'llamaindex', 'openai', 'flask', 'django', 'react', 'whisper', 'bert', 'yolo', 'resnet', 'transformers', 'numpy', 'pandas', 'opencv', 'sqlite', 'redis', 'celery', 'linux', 'git']);

    function skillTerms(nq) {
        return [...new Set(SKILL_VOCAB)].filter(t => t.length > 1 && hasPhrase(nq, t));
    }

    function skillAnswer(terms) {
        const lines = [], found = [], missing = [];
        const focus = new Set();
        terms.forEach(t => {
            const re = new RegExp('(^|[^a-z])' + t.replace(/[.+#]/g, '\$&') + '([^a-z]|$)', 'i');
            const where = SKILL_SOURCES.filter(s => re.test(s.text));
            if (where.length) {
                found.push(t);
                where.forEach(w => { if (w.project) focus.add(w.project.id); });
                lines.push(`▸ ${t.toUpperCase()}: confirmed. ${where.map(w => w.where).join(', ')}`);
            } else {
                missing.push(t);
                lines.push(`▸ ${t.toUpperCase()}: no record in his skills or projects`);
            }
        });
        const actions = [];
        if (focus.size) actions.push({ label: 'Show those projects', kind: 'focus', value: [...focus] });
        actions.push({ label: 'Go to skills', kind: 'scroll', value: 'skills' });
        return {
            text: lines.join('\n') + (missing.length ? '\n\nI only confirm what I can point to. For the rest, ask Jeevan.' : ''),
            source: { label: 'Skills section + project stacks', href: '#skills' },
            actions, chips: ['What skills does Jeevan have?']
        };
    }

    // ---------- router ----------

    const SECTIONS = { about: 'about', profile: 'about', experience: 'experience', exp: 'experience', work: 'projects', projects: 'projects', project: 'projects', skills: 'skills', skill: 'skills', contact: 'contact', top: 'top', home: 'top' };

    let lastProject = null;

    async function ask(question) {
        const q = (question || '').trim().slice(0, 300);
        const nq = norm(q);

        if (!q) return { text: 'Standing by. Ask about Jeevan\'s projects, skills or experience.', source: null, actions: [], chips: SUGGESTED };

        if (/^ (hi|hello|hey|yo|hola|namaste|hii+|good (morning|afternoon|evening)) ?\W*$/.test(nq) || (nq.split(' ').length <= 4 && /^ (hi|hello|hey) /.test(nq))) {
            return {
                text: 'Cortex online. I track everything Jeevan has built: AI, ML, data science, RAG, NLP, vision. Where do you want to start?',
                source: null, actions: [], chips: SUGGESTED
            };
        }
        if (/ (thanks|thank you|thx|cool|great|nice|awesome|ok|okay) $/.test(nq) && nq.split(' ').length <= 5) {
            return { text: 'Standing by.', source: null, actions: [], chips: SUGGESTED.slice(1, 4) };
        }
        if (/ (help|what can you do|what do you do|commands|options|menu) /.test(nq)) {
            return {
                text: 'Here is what I can pull:\n\n▸ Work by domain: "show me your RAG work", "data science projects"\n▸ Project internals, read live from the README: "how does Lumina work?"\n▸ Live GitHub: "what is he working on?", "how many stars?"\n▸ Record: education, internships, skills, contact\n▸ Actions: resume, email, jump to any section\n\nEvery answer carries its source. No source, no answer.',
                source: null, actions: [], chips: SUGGESTED
            };
        }
        if (/ (who|what) are you $| are you (an? )?(ai|bot|llm|real|human|chatgpt|gpt)| how do you work| how are you built| what is cortex $/.test(nq)) {
            return docAnswer(KB.docs.find(d => d.id === 'site'));
        }
        if (/ (resume|curriculum vitae|download (your |his )?cv|your cv|his cv) /.test(nq)) {
            return {
                text: 'Resume is ready. One page, PDF.',
                source: { label: KB.owner.resume, href: KB.owner.resume },
                actions: [{ label: 'Open resume', kind: 'open', value: KB.owner.resume }], chips: ['How do I contact Jeevan?']
            };
        }
        const nav = /^ (go to|take me to|scroll to|jump to|open|show)( the)? (\w+)( section)? $/.exec(nq);
        if (nav && SECTIONS[nav[3]]) {
            return { text: `Moving you to ${nav[3]}.`, source: null, actions: [{ label: 'Go', kind: 'scroll', value: SECTIONS[nav[3]], auto: true }], chips: [] };
        }
        if (/^ (open )?(github|linkedin) $/.test(nq)) {
            const gh = nq.includes('github');
            return { text: `Opening ${gh ? 'GitHub' : 'LinkedIn'}.`, source: null, actions: [{ label: gh ? 'GitHub' : 'LinkedIn', kind: 'open', value: gh ? GH : KB.owner.linkedin }], chips: [] };
        }
        if (/ (latest|recent|recently|lately|activity|currently|working on|now|commits?|pushed|updated|stars?|starred|how many repos|how many projects|repositories|repos|languages?) /.test(nq)
            && !matchProjects(nq).length && !/ (skills?|know|languages? (do|does) (you|he) (know|speak)) /.test(nq)) {
            return githubAnswer(nq);
        }
        if (/ (domains?|areas?|fields?|specializ\w*|specialis\w*|focus|expertise|niche) /.test(nq) && !matchDomains(nq).length) {
            return domainsOverview();
        }

        if (/ (looking|available|availability|open to|hire|hiring|recruit\w*) /.test(nq)) {
            return docAnswer(KB.docs.find(d => d.id === 'availability'));
        }
        if (/ (internships?|experience|work experience|worked|jobs?|employment|companies) /.test(nq) && !matchProjects(nq).length && !matchDomains(nq).filter(d => d !== 'ai').length && !skillTerms(nq).length) {
            const exp = KB.docs.filter(d => d.section === 'experience');
            return {
                text: 'Two internships on record:\n\n' + exp.map(d => `▸ ${d.title}\n  ${d.text.split('. ').slice(1).join('. ')}`).join('\n\n'),
                source: { label: 'Experience section', href: '#experience' },
                actions: [{ label: 'Go to experience', kind: 'scroll', value: 'experience' }],
                chips: ['Show me Healthcare AI work', 'What skills does Jeevan have?']
            };
        }
        const terms = skillTerms(nq);
        if (terms.length && / (know|knows|use|used|uses|familiar|experience|worked|work with|skilled|proficient|can (he|you)|does (he|you)|do you|has (he|you)|any) /.test(nq)) {
            return skillAnswer(terms);
        }

        let projects = matchProjects(nq);
        if (!projects.length && lastProject && / (it|this|that|this project|that project) /.test(nq)) projects = [lastProject];
        if (/ (another|other|next) project /.test(nq)) {
            const i = lastProject ? KB.projects.indexOf(lastProject) : -1;
            projects = [KB.projects[(i + 1) % KB.projects.length]];
        }
        if (projects.length === 1) {
            const p = projects[0];
            lastProject = p;
            if (/ (how|architecture|readme|setup|install|run|design|pipeline|tested|tests?|eval\w*|metrics?|details?|explain|deep|works?|built|approach|method|data|dataset|limitations?|failed|challenges?) /.test(nq)) {
                return readmeAnswer(p, q);
            }
            if (/ (stack|tech|tools|technolog\w*|libraries|framework\w*) /.test(nq)) {
                return { text: `${p.name} stack: ${p.stack.join(' · ')}`, source: { label: 'Projects section', href: '#projects' }, actions: [{ label: 'Open repo', kind: 'open', value: repoUrl(p) }], chips: [`How does ${p.name} work?`] };
            }
            if (/ (result|achieve\w*|outcome|accuracy|score|impact|numbers?) /.test(nq)) {
                return { text: `${p.name}: ${p.result}`, source: { label: 'Projects section', href: '#projects' }, actions: [{ label: 'Show on page', kind: 'focus', value: [p.id] }], chips: [`How was ${p.name} tested?`] };
            }
            return projectAnswer(p);
        }

        const domains = matchDomains(nq).filter(d => !(d === 'ai' && matchDomains(nq).length > 1));
        if (domains.length && (/ (show|work|projects?|experience|done|built|build|portfolio|any|examples?|did|do|has|have) /.test(nq) || nq.split(' ').length <= 5)) {
            return domainAnswer(domains);
        }

        if (/ (best|top|flagship|strongest|favou?rite|proudest|featured) /.test(nq)) {
            lastProject = projectById.lumina;
            const a = projectAnswer(projectById.lumina);
            a.text = 'Flagship: ' + a.text;
            return a;
        }
        if (/ (all|list|every) (the )?projects | projects$/.test(nq) || /^ (projects|portfolio|work) $/.test(nq)) {
            return {
                text: `${KB.projects.length} projects on record:\n\n` + KB.projects.map((p, i) => `${String(i + 1).padStart(2, '0')} ▸ ${p.name}\n    ${p.hook}`).join('\n'),
                source: { label: 'Projects section', href: '#projects' },
                actions: [{ label: 'Go to projects', kind: 'scroll', value: 'projects' }],
                chips: KB.projects.slice(0, 3).map(p => `Tell me about ${p.name}`)
            };
        }

        const hits = search(kbIndex, q);
        const top = hits[0];
        if (top && top.score >= 1.6) {
            if (top.doc.kind === 'project') { lastProject = top.doc.project; return projectAnswer(top.doc.project); }
            const second = hits[1] && hits[1].score > top.score * 0.75 && hits[1].doc.kind === 'doc' ? hits[1].doc.title : null;
            const a = docAnswer(top.doc, second ? `Tell me about ${second.toLowerCase()}` : null);
            if (/ (email|contact|reach|hire|hiring|connect) /.test(nq) && top.doc.id !== 'contact') a.actions.unshift(...ownerLinks());
            return a;
        }

        return {
            text: 'No record of that. My scope is Jeevan\'s work, and I don\'t guess outside it. He can answer you directly.',
            source: { label: 'No matching source' },
            actions: ownerLinks().slice(0, 2),
            chips: SUGGESTED.slice(0, 3)
        };
    }

    async function askDeduped(q) {
        const a = await ask(q);
        const seen = new Set();
        a.actions = (a.actions || []).filter(x => { const k = x.kind + x.value; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 4);
        return a;
    }

    root.CortexAgent = { ask: askDeduped, suggested: SUGGESTED, _tokens: tokens };
})(typeof window !== 'undefined' ? window : globalThis);
