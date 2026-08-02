/* ================================================
   CORTEX AI COMPANION — Logic Module
   A tiny intelligent process for the portfolio OS
   ================================================ */

(function CortexModule() {
    'use strict';

    // ========== CONSTANTS ==========

    const COLORS = {
        primary: '#B1FFD6',
        secondary: '#8B5CF6',
        bg: '#0e1513',
        dark: '#050505',
        muted: '#889990'
    };

    const SECTION_MESSAGES = {
        hero: 'Initializing...',
        about: 'Loading Profile...',
        experience: 'Experience Indexed',
        projects: 'Analyzing Projects...',
        skills: 'Capabilities Loaded',
        contact: 'Communication Ready'
    };

    const SECTION_ORDER = ['hero', 'about', 'experience', 'projects', 'skills', 'contact'];

    const TOUR_MESSAGES = {
        hero: 'This is the command center.',
        about: 'Key metrics and background.',
        experience: 'Professional experience log.',
        projects: 'Repository showcase.',
        skills: 'Technical capability matrix.',
        contact: 'Open a channel.'
    };

    const RANDOM_ACTIONS = [
        'blink', 'wave', 'lookAround', 'spin',
        'floatHigher', 'scan', 'sleepBrief', 'particles'
    ];

    const ROBOT_SVG = `<svg class="cortex-robot-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 34" width="64" height="68" aria-hidden="true">
        <defs>
            <filter id="cx-glow"><feGaussianBlur stdDeviation="0.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <g class="cortex-head-group">
            <line x1="16" y1="3" x2="16" y2="6" stroke="${COLORS.secondary}" stroke-width="1" stroke-linecap="round"/>
            <circle class="cortex-antenna-tip" cx="16" cy="2" r="1.5" fill="${COLORS.secondary}"/>
            <rect x="7" y="6" width="18" height="12" rx="2" fill="#1a2520" stroke="${COLORS.primary}" stroke-width="0.7"/>
            <rect x="9" y="8" width="14" height="8" rx="0.5" fill="${COLORS.dark}"/>
            <line x1="9" y1="10" x2="23" y2="10" stroke="${COLORS.primary}" stroke-width="0.15" opacity="0.15"/>
            <line x1="9" y1="12" x2="23" y2="12" stroke="${COLORS.primary}" stroke-width="0.15" opacity="0.1"/>
            <line x1="9" y1="14" x2="23" y2="14" stroke="${COLORS.primary}" stroke-width="0.15" opacity="0.08"/>
            <rect class="cortex-screen-overlay" x="9" y="8" width="14" height="1" fill="${COLORS.primary}" opacity="0" rx="0.2"/>
            <g class="cortex-eye-left">
                <rect x="11" y="10" width="4" height="3" rx="0.5" fill="rgba(177,255,214,0.08)"/>
                <rect class="cortex-pupil cortex-pupil-left" x="12" y="10.5" width="2" height="2" rx="0.3" fill="${COLORS.primary}" filter="url(#cx-glow)"/>
            </g>
            <g class="cortex-eye-right">
                <rect x="19" y="10" width="4" height="3" rx="0.5" fill="rgba(177,255,214,0.08)"/>
                <rect class="cortex-pupil cortex-pupil-right" x="20" y="10.5" width="2" height="2" rx="0.3" fill="${COLORS.primary}" filter="url(#cx-glow)"/>
            </g>
        </g>
        <rect x="9" y="19" width="14" height="7" rx="1.5" fill="#1a2520" stroke="${COLORS.primary}" stroke-width="0.5"/>
        <line x1="12" y1="21.5" x2="20" y2="21.5" stroke="${COLORS.primary}" stroke-width="0.3" opacity="0.25"/>
        <line x1="12" y1="23.5" x2="20" y2="23.5" stroke="${COLORS.primary}" stroke-width="0.3" opacity="0.15"/>
        <circle cx="16" cy="22.5" r="1" fill="${COLORS.secondary}" opacity="0.5"/>
        <g class="cortex-arm-left"><rect x="5" y="20" width="4" height="2.5" rx="1" fill="#1a2520" stroke="${COLORS.primary}" stroke-width="0.4"/></g>
        <g class="cortex-arm-right"><rect x="23" y="20" width="4" height="2.5" rx="1" fill="#1a2520" stroke="${COLORS.primary}" stroke-width="0.4"/></g>
        <rect x="12" y="26.5" width="8" height="2.5" rx="0.5" fill="${COLORS.secondary}" opacity="0.8"/>
        <g class="cortex-flame">
            <rect x="14" y="29" width="4" height="2" fill="${COLORS.primary}" opacity="0.55" rx="0.3"/>
            <rect x="15" y="30.5" width="2" height="1.5" fill="${COLORS.secondary}" opacity="0.35" rx="0.2"/>
        </g>
    </svg>`;

    // ========== STATE ==========

    const state = {
        initialized: false,
        visible: false,
        sleeping: false,
        currentSection: 'hero',
        terminalOpen: false,
        tourActive: false,
        lastActivity: Date.now(),
        startTime: Date.now(),
        shownSectionMessages: new Set(),
        shownLongStayMsg: false,
        randomQueue: [],
        typedBuffer: '',
        keyBufferTimer: null,
        cursorX: 0,
        cursorY: 0,
        cursorIdle: false,
        cursorIdleTimer: null,
        proximity: false,
        sleepTimer: null,
        randomTimer: null,
        speechTimer: null,
        entranceTimer: null,
        blinkTimer: null,
        isMobile: false,
        reducedMotion: false,
        tabVisible: true,
        viewedProjects: new Set(),
        projectHoverTimers: {},
        animatingGesture: false,
        achievementQueue: [],
        sessionTimeInterval: null,
        tourDismissTimer: null
    };

    // ========== DOM REFERENCES ==========

    let els = {};

    // ========== MEMORY MODULE ==========

    const Memory = {
        KEY: 'cortex_memory',

        getDefault() {
            return {
                visitCount: 0,
                firstVisit: null,
                lastVisit: null,
                viewedSections: [],
                viewedProjects: [],
                downloadedResume: false,
                totalTimeMs: 0,
                tourCompleted: false,
                achievements: []
            };
        },

        load() {
            try {
                const raw = localStorage.getItem(this.KEY);
                if (!raw) return this.getDefault();
                const data = JSON.parse(raw);
                // Merge with defaults for forward-compatibility
                return Object.assign(this.getDefault(), data);
            } catch { return this.getDefault(); }
        },

        save(data) {
            try { localStorage.setItem(this.KEY, JSON.stringify(data)); } catch {}
        },

        update(fn) {
            const data = this.load();
            fn(data);
            this.save(data);
            return data;
        }
    };

    // ========== SPEECH MODULE ==========

    const Speech = {
        queue: [],
        active: false,

        show(text, duration) {
            duration = duration || 2000;
            this.queue.push({ text, duration });
            if (!this.active) this._next();
        },

        _next() {
            if (this.queue.length === 0) { this.active = false; return; }
            this.active = true;
            const { text, duration } = this.queue.shift();
            if (!els.speech) return;
            els.speech.textContent = text;
            els.speech.classList.add('cortex-speech-visible');
            clearTimeout(state.speechTimer);
            state.speechTimer = setTimeout(() => {
                els.speech.classList.remove('cortex-speech-visible');
                setTimeout(() => this._next(), 300);
            }, duration);
        },

        clear() {
            this.queue = [];
            this.active = false;
            clearTimeout(state.speechTimer);
            if (els.speech) els.speech.classList.remove('cortex-speech-visible');
        }
    };

    // ========== PARTICLES MODULE ==========

    const Particles = {
        spawn(count) {
            count = count || 3;
            if (state.reducedMotion || !els.particleContainer) return;
            for (let i = 0; i < count; i++) {
                const p = document.createElement('div');
                p.className = 'cortex-particle';
                const angle = Math.random() * Math.PI * 2;
                const dist = 15 + Math.random() * 25;
                p.style.setProperty('--cx-px', `${Math.cos(angle) * dist}px`);
                p.style.setProperty('--cx-py', `${Math.sin(angle) * dist}px`);
                p.style.left = (25 + Math.random() * 14) + 'px';
                p.style.top = (20 + Math.random() * 14) + 'px';
                p.style.background = Math.random() > 0.5 ? COLORS.secondary : COLORS.primary;
                p.style.animationDelay = (Math.random() * 0.3) + 's';
                els.particleContainer.appendChild(p);
                setTimeout(() => p.remove(), 2200);
            }
        }
    };

    // ========== NOTIFICATIONS MODULE ==========

    const Notifications = {
        show(title, body, desc, duration) {
            duration = duration || 3000;
            if (!els.notifications) return;
            const n = document.createElement('div');
            n.className = 'cortex-notification';
            n.setAttribute('role', 'status');
            n.setAttribute('aria-live', 'polite');
            n.innerHTML =
                `<div class="cortex-notification-title">${title}</div>` +
                `<div class="cortex-notification-body">${body}</div>` +
                (desc ? `<div class="cortex-notification-desc">${desc}</div>` : '');
            els.notifications.appendChild(n);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => n.classList.add('cortex-notification-visible'));
            });
            setTimeout(() => {
                n.classList.remove('cortex-notification-visible');
                setTimeout(() => n.remove(), 400);
            }, duration);
        },

        system(body) {
            this.show('System', body, null, 2500);
        },

        achievement(name, desc) {
            this.show('Achievement Unlocked', name, desc, 4000);
        }
    };

    // ========== CURSOR TRACKER ==========

    const CursorTracker = {
        _rafId: null,
        _lastUpdate: 0,

        init() {
            if (state.isMobile) return;
            document.addEventListener('mousemove', (e) => {
                state.cursorX = e.clientX;
                state.cursorY = e.clientY;
                state.lastActivity = Date.now();
                if (state.sleeping) SleepMode.wake();
            });
            this._tick();
        },

        _tick() {
            if (!state.tabVisible) {
                this._rafId = requestAnimationFrame(() => this._tick());
                return;
            }
            const now = performance.now();
            if (now - this._lastUpdate > 33) { // ~30fps
                this._lastUpdate = now;
                this._updateEyes();
            }
            this._rafId = requestAnimationFrame(() => this._tick());
        },

        _updateEyes() {
            if (!state.visible || state.sleeping || !els.robotSvg) return;
            const rect = els.container.getBoundingClientRect();
            const robotCx = rect.left + rect.width / 2;
            const robotCy = rect.top + 20; // ~eye level
            const dx = state.cursorX - robotCx;
            const dy = state.cursorY - robotCy;
            const angle = Math.atan2(dy, dx);
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxShift = 1;
            const factor = Math.min(dist / 200, 1);
            const ex = Math.cos(angle) * maxShift * factor;
            const ey = Math.sin(angle) * maxShift * factor;

            const pupils = els.robotSvg.querySelectorAll('.cortex-pupil');
            pupils.forEach(p => {
                p.style.transform = `translate(${ex}px, ${ey}px)`;
            });

            // Subtle head tilt toward cursor (max ±15°)
            const headGroup = els.robotSvg.querySelector('.cortex-head-group');
            if (headGroup) {
                const headAngle = Math.max(-15, Math.min(15, (dx / window.innerWidth) * 30));
                headGroup.style.transform = `rotate(${headAngle}deg)`;
            }
        },

        destroy() {
            cancelAnimationFrame(this._rafId);
        }
    };

    // ========== POSITION MANAGER ==========
    // Moves the robot to the empty corner for each section.
    // Positions are defined as { xSide, ySide } anchors—
    //   chosen to land in whitespace based on the known layout.

    const PositionManager = {
        POSITIONS: {
            hero:       { xSide: 'right', ySide: 'bottom' }, // below the hero text block
            about:      { xSide: 'left',  ySide: 'bottom' }, // left of the stat cards
            experience: { xSide: 'right', ySide: 'top'    }, // upper-right beside timeline
            projects:   { xSide: 'left',  ySide: 'top'    }, // upper-left above marquee
            skills:     { xSide: 'right', ySide: 'top'    }, // upper-right in dark section
            contact:    { xSide: 'left',  ySide: 'bottom' }, // lower-left beside contact card
        },
        MARGIN_X: 40,
        MARGIN_Y_TOP: 110,   // clear the fixed nav bar
        MARGIN_Y_BOTTOM: 80, // clear above viewport bottom

        _px(section) {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const rw = 64, rh = 68;
            const isMobile = vw < 768;
            const mx = isMobile ? 14 : this.MARGIN_X;
            const myTop = isMobile ? 80 : this.MARGIN_Y_TOP;
            const myBot = isMobile ? 20 : this.MARGIN_Y_BOTTOM;
            const pos = this.POSITIONS[section] || this.POSITIONS.hero;
            const left = pos.xSide === 'left' ? mx : vw - rw - mx;
            const top  = pos.ySide === 'top'  ? myTop : vh - rh - myBot;
            return { left, top };
        },

        moveTo(section) {
            if (!els.container) return;
            const { left, top } = this._px(section);
            els.container.style.left   = left + 'px';
            els.container.style.top    = top  + 'px';
            els.container.style.right  = 'auto';
            els.container.style.bottom = 'auto';
        },

        // Re-snap on resize without animation
        _onResize() {
            const transitionBackup = els.container.style.transition;
            els.container.style.transition = 'none';
            this.moveTo(state.currentSection || 'hero');
            // Force reflow then restore transition
            // eslint-disable-next-line no-unused-expressions
            els.container.offsetLeft;
            els.container.style.transition = transitionBackup;
        },

        initResize() {
            window.addEventListener('resize', () => this._onResize(), { passive: true });
        }
    };


    // ========== SECTION OBSERVER ==========

    const SectionObserver = {
        _observer: null,
        _sectionMap: {},

        init() {
            this._mapSections();
            this._observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const sectionId = entry.target.id || 'hero';
                        const mapped = this._resolveSection(sectionId);
                        if (mapped && mapped !== state.currentSection) {
                            state.currentSection = mapped;
                            this._onSectionEnter(mapped);
                        }
                    }
                });
            }, { threshold: 0.3 });

            Object.values(this._sectionMap).forEach(el => {
                if (el) this._observer.observe(el);
            });
        },

        _mapSections() {
            const sections = document.querySelectorAll('section');
            // Hero is the first section (has no id)
            if (sections[0]) this._sectionMap.hero = sections[0];
            ['about', 'experience', 'projects', 'skills', 'contact'].forEach(id => {
                const el = document.getElementById(id);
                if (el) this._sectionMap[id] = el;
            });
        },

        _resolveSection(id) {
            if (this._sectionMap[id]) return id;
            // First section is hero
            const first = Object.values(this._sectionMap)[0];
            if (first && first.id === id) return 'hero';
            return null;
        },

        _onSectionEnter(section) {
            // Reposition robot to the empty area of this section
            PositionManager.moveTo(section);

            // Track in memory
            Memory.update(d => {
                if (!d.viewedSections.includes(section)) {
                    d.viewedSections.push(section);
                }
            });

            // Show section message (once per session)
            if (!state.shownSectionMessages.has(section) && state.visible) {
                state.shownSectionMessages.add(section);
                const msg = SECTION_MESSAGES[section];
                if (msg) Speech.show(msg, 2000);
            }

            // Check explorer achievement
            Achievements.check();
        }
    };

    // ========== HOVER REACTIONS ==========

    const HoverReactions = {
        _bindings: [],

        init() {
            this._bind('a[href="#projects"]', 'pointing', 'Explore my work.');
            this._bind('a[href*="resume" i], a[href*="RESUME" i]', 'wave', 'Resume Ready.');
            this._bind('a[href^="mailto:"]', 'wave', "Let's connect.", 'mail');
            this._bind('a[href*="linkedin"]', 'salute', null, null);
            this._bind('a[href*="github"]', null, null, 'terminal');
            this._bindProjectCards();
            this._bindResumeClick();
        },

        _bind(selector, gesture, speech, iconName) {
            document.querySelectorAll(selector).forEach(el => {
                let debounceTimer = null;
                const enter = () => {
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(() => {
                        if (!state.visible || state.sleeping || state.tourActive) return;
                        if (gesture && !state.animatingGesture) this._gesture(gesture);
                        if (speech) Speech.show(speech, 2000);
                        if (iconName) this._showIcon(iconName);
                    }, 200);
                };
                const leave = () => {
                    clearTimeout(debounceTimer);
                    this._clearGesture();
                    this._hideIcon();
                };
                el.addEventListener('mouseenter', enter);
                el.addEventListener('mouseleave', leave);
                this._bindings.push({ el, enter, leave });
            });
        },

        _bindProjectCards() {
            const cards = document.querySelectorAll('#projects .flex-none');
            cards.forEach((card, i) => {
                let hoverStart = 0;
                let timer1 = null, timer2 = null;
                card.addEventListener('mouseenter', () => {
                    if (!state.visible || state.sleeping) return;
                    hoverStart = Date.now();
                    state.viewedProjects.add(i % 4); // 4 unique projects
                    Memory.update(d => {
                        const projNames = ['lumina-rag', 'healthcare', 'disaster', 'cafecritic'];
                        const name = projNames[i % 4];
                        if (name && !d.viewedProjects.includes(name)) {
                            d.viewedProjects.push(name);
                        }
                    });
                    timer1 = setTimeout(() => {
                        Speech.show('Analyzing implementation...', 2000);
                    }, 1000);
                    timer2 = setTimeout(() => {
                        Speech.show('Architecture looks solid.', 2000);
                    }, 3000);
                    Achievements.check();
                });
                card.addEventListener('mouseleave', () => {
                    clearTimeout(timer1);
                    clearTimeout(timer2);
                });
            });
        },

        _bindResumeClick() {
            document.querySelectorAll('a[href*="resume" i], a[href*="RESUME" i]').forEach(el => {
                el.addEventListener('click', () => {
                    Memory.update(d => { d.downloadedResume = true; });
                    setTimeout(() => Speech.show('Candidate profile exported.', 2500), 500);
                });
            });
        },

        _gesture(name) {
            if (!els.robotSvg || state.animatingGesture) return;
            state.animatingGesture = true;
            els.robotSvg.classList.add('cortex-' + name);
            setTimeout(() => {
                this._clearGesture();
            }, 1000);
        },

        _clearGesture() {
            if (!els.robotSvg) return;
            els.robotSvg.classList.remove('cortex-pointing', 'cortex-wave', 'cortex-salute');
            state.animatingGesture = false;
        },

        _showIcon(name) {
            if (!els.miniIcon) return;
            els.miniIcon.textContent = name;
            els.miniIcon.classList.add('cortex-icon-visible');
        },

        _hideIcon() {
            if (!els.miniIcon) return;
            els.miniIcon.classList.remove('cortex-icon-visible');
        }
    };

    // ========== RANDOM BEHAVIOR SCHEDULER ==========

    const RandomScheduler = {
        init() {
            this._schedule();
        },

        _schedule() {
            if (!state.tabVisible) return;
            const delay = 20000 + Math.random() * 20000; // 20-40s
            clearTimeout(state.randomTimer);
            state.randomTimer = setTimeout(() => {
                if (state.visible && !state.sleeping && !state.tourActive && !state.terminalOpen) {
                    this._execute();
                }
                this._schedule();
            }, delay);
        },

        _execute() {
            if (state.randomQueue.length === 0) {
                state.randomQueue = this._shuffle([...RANDOM_ACTIONS]);
            }
            const action = state.randomQueue.pop();
            this._perform(action);
        },

        _perform(action) {
            if (!els.robotSvg || !els.wrapper) return;
            switch (action) {
                case 'blink':
                    this._blink();
                    break;
                case 'wave':
                    if (!state.animatingGesture) {
                        state.animatingGesture = true;
                        els.robotSvg.classList.add('cortex-wave');
                        setTimeout(() => { els.robotSvg.classList.remove('cortex-wave'); state.animatingGesture = false; }, 800);
                    }
                    break;
                case 'lookAround':
                    this._lookAround();
                    break;
                case 'spin':
                    els.robotSvg.classList.add('cortex-spin-anim');
                    setTimeout(() => els.robotSvg.classList.remove('cortex-spin-anim'), 900);
                    break;
                case 'floatHigher':
                    els.wrapper.classList.add('cortex-float-higher');
                    setTimeout(() => els.wrapper.classList.remove('cortex-float-higher'), 1600);
                    break;
                case 'scan':
                    els.robotSvg.classList.add('cortex-scanning');
                    Speech.show('Scanning...', 1500);
                    setTimeout(() => els.robotSvg.classList.remove('cortex-scanning'), 1200);
                    break;
                case 'sleepBrief':
                    els.robotSvg.classList.add('cortex-sleeping');
                    setTimeout(() => els.robotSvg.classList.remove('cortex-sleeping'), 2500);
                    break;
                case 'particles':
                    Particles.spawn(5);
                    break;
            }
        },

        _blink() {
            if (!els.robotSvg) return;
            els.robotSvg.classList.add('cortex-blink');
            setTimeout(() => els.robotSvg.classList.remove('cortex-blink'), 150);
        },

        _lookAround() {
            const pupils = els.robotSvg ? els.robotSvg.querySelectorAll('.cortex-pupil') : [];
            if (pupils.length === 0) return;
            // Look left
            pupils.forEach(p => p.style.transform = 'translate(-1.2px, 0)');
            setTimeout(() => {
                // Look right
                pupils.forEach(p => p.style.transform = 'translate(1.2px, 0)');
                setTimeout(() => {
                    // Center
                    pupils.forEach(p => p.style.transform = '');
                }, 600);
            }, 600);
        },

        _shuffle(arr) {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }
    };

    // ========== IDLE BLINK TIMER ==========

    const IdleBlink = {
        init() {
            this._scheduleBlink();
        },

        _scheduleBlink() {
            const delay = 3000 + Math.random() * 5000; // 3-8s
            clearTimeout(state.blinkTimer);
            state.blinkTimer = setTimeout(() => {
                if (state.visible && !state.sleeping && els.robotSvg) {
                    els.robotSvg.classList.add('cortex-blink');
                    setTimeout(() => els.robotSvg.classList.remove('cortex-blink'), 150);
                }
                this._scheduleBlink();
            }, delay);
        }
    };

    // ========== SLEEP MODE ==========

    const SleepMode = {
        TIMEOUT: 15000,

        init() {
            ['mousemove', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
                document.addEventListener(evt, () => this._onActivity(), { passive: true });
            });
            this._resetTimer();
        },

        _onActivity() {
            state.lastActivity = Date.now();
            if (state.sleeping) this.wake();
            this._resetTimer();
        },

        _resetTimer() {
            clearTimeout(state.sleepTimer);
            state.sleepTimer = setTimeout(() => {
                if (state.visible && !state.terminalOpen && !state.tourActive) {
                    this.sleep();
                }
            }, this.TIMEOUT);
        },

        sleep() {
            if (state.sleeping) return;
            state.sleeping = true;
            if (els.robotSvg) els.robotSvg.classList.add('cortex-sleeping');
            if (els.wrapper) {
                els.wrapper.classList.remove('cortex-floating');
                els.wrapper.classList.add('cortex-sleeping-float');
            }
            Speech.show('Zzz...', 3000);
        },

        wake() {
            if (!state.sleeping) return;
            state.sleeping = false;
            if (els.robotSvg) els.robotSvg.classList.remove('cortex-sleeping');
            if (els.wrapper) {
                els.wrapper.classList.remove('cortex-sleeping-float');
                els.wrapper.classList.add('cortex-floating');
            }
            Speech.show('Back online.', 1500);
        }
    };

    // ========== DEVELOPER TERMINAL ==========

    const Terminal = {
        _typingTimer: null,
        _history: [],
        _historyIndex: -1,

        init() {
            document.addEventListener('keydown', (e) => {
                if (state.terminalOpen || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                state.typedBuffer += e.key.toLowerCase();
                clearTimeout(state.keyBufferTimer);
                state.keyBufferTimer = setTimeout(() => { state.typedBuffer = ''; }, 2000);
                if (state.typedBuffer.includes('cortex')) {
                    state.typedBuffer = '';
                    this.open();
                }
            });
        },

        open() {
            if (state.terminalOpen) return;
            state.terminalOpen = true;
            if (!els.terminalOverlay) return;
            els.terminalOverlay.classList.add('cortex-terminal-open');
            els.terminalOutput.innerHTML = '';
            this._printLine('CORTEX Terminal v1.0', 'cx-dim');
            this._printLine('Type "help" for available commands.\n', 'cx-dim');
            els.terminalInput.value = '';
            setTimeout(() => els.terminalInput.focus(), 100);

            // Track achievement
            Memory.update(d => {
                if (!d.achievements.includes('curious')) {
                    d.achievements.push('curious');
                }
            });
            Achievements.check();

            // Speech
            Speech.show('Developer Mode.', 1500);
        },

        close() {
            if (!state.terminalOpen) return;
            state.terminalOpen = false;
            if (els.terminalOverlay) els.terminalOverlay.classList.remove('cortex-terminal-open');
            clearTimeout(this._typingTimer);
        },

        handleCommand(cmd) {
            cmd = cmd.trim().toLowerCase();
            if (!cmd) return;
            this._history.push(cmd);
            this._historyIndex = this._history.length;
            this._printLine(`cortex@portfolio:~$ ${cmd}`, 'cx-prompt');

            const response = this._getResponse(cmd);
            if (response.action) response.action();
            this._typeResponse(response.text, response.cls || 'cx-response');
        },

        navigateHistory(direction) {
            if (this._history.length === 0) return;
            this._historyIndex += direction;
            this._historyIndex = Math.max(0, Math.min(this._history.length, this._historyIndex));
            els.terminalInput.value = this._history[this._historyIndex] || '';
        },

        _getResponse(cmd) {
            const mem = Memory.load();
            switch (cmd) {
                case 'help':
                    return { text:
                        '  Available Commands\n' +
                        '  ─────────────────────────\n' +
                        '  help      Show this menu\n' +
                        '  status    System diagnostics\n' +
                        '  whoami    Identity profile\n' +
                        '  projects  Repository listing\n' +
                        '  resume    Export resume\n' +
                        '  github    Open GitHub\n' +
                        '  linkedin  Open LinkedIn\n' +
                        '  skills    Capability matrix\n' +
                        '  clear     Clear terminal\n'
                    };
                case 'status': {
                    const uptime = Math.floor((Date.now() - state.startTime) / 1000);
                    const m = Math.floor(uptime / 60);
                    const s = uptime % 60;
                    return { text:
                        '  ╔════════════════════════════════╗\n' +
                        '  ║  CORTEX v1.0 — STATUS REPORT   ║\n' +
                        '  ╠════════════════════════════════╣\n' +
                        `  ║  Uptime:   ${m}m ${s}s${' '.repeat(Math.max(0, 15 - `${m}m ${s}s`.length))}  ║\n` +
                        `  ║  Section:  ${state.currentSection.toUpperCase().padEnd(15)}  ║\n` +
                        `  ║  Visitor:  ${mem.visitCount <= 1 ? 'First-time      ' : `Returning (#${mem.visitCount})`.padEnd(16)}  ║\n` +
                        `  ║  State:    ${state.sleeping ? 'Sleeping        ' : 'Active          '}  ║\n` +
                        '  ║  CPU:      Nominal            ║\n' +
                        '  ╚════════════════════════════════╝\n'
                    };
                }
                case 'whoami':
                    return { text:
                        '  ┌───────────────────────────────┐\n' +
                        '  │  Jeevan Raj M                 │\n' +
                        '  │  AI/ML Engineer                │\n' +
                        '  │  Final Year @ Mysore Uni       │\n' +
                        '  │  Focus: DL · NLP · CV          │\n' +
                        '  │  GPA: 9.74 / 10                │\n' +
                        '  └───────────────────────────────┘\n'
                    };
                case 'projects':
                    return { text:
                        '  ┌────────────────────────────────────┐\n' +
                        '  │  01 ▸ Lumina RAG Assistant    [★]  │\n' +
                        '  │      Private document AI           │\n' +
                        '  │                                    │\n' +
                        '  │  02 ▸ AI Healthcare Platform  [⚡] │\n' +
                        '  │      Diagnostics & analytics       │\n' +
                        '  │                                    │\n' +
                        '  │  03 ▸ Disaster Segmentation   [✓]  │\n' +
                        '  │      Satellite CV assessment       │\n' +
                        '  │                                    │\n' +
                        '  │  04 ▸ CafeCritic              [✓]  │\n' +
                        '  │      ML recommender system         │\n' +
                        '  └────────────────────────────────────┘\n'
                    };
                case 'skills':
                    return { text:
                        '  _LANGUAGES    Python · C++ · SQL\n' +
                        '  _ML/AI        PyTorch · TensorFlow · NLP · CV\n' +
                        '  _CLOUD        AWS · Docker · FastAPI\n' +
                        '  _TOOLS        Git · Linux · Jupyter\n'
                    };
                case 'resume':
                    return {
                        text: '  Exporting resume...\n  Opening in new tab.\n',
                        action: () => {
                            Memory.update(d => { d.downloadedResume = true; });
                            setTimeout(() => window.open('resume.pdf', '_blank'), 500);
                        }
                    };
                case 'github':
                    return {
                        text: '  Connecting to GitHub...\n',
                        action: () => setTimeout(() => window.open('https://github.com/jeevanraj-28', '_blank'), 400)
                    };
                case 'linkedin':
                    return {
                        text: '  Opening LinkedIn profile...\n',
                        action: () => setTimeout(() => window.open('https://linkedin.com/in/jeevan-raj-m-5ba64a383', '_blank'), 400)
                    };
                case 'clear':
                    return {
                        text: '',
                        action: () => { if (els.terminalOutput) els.terminalOutput.innerHTML = ''; }
                    };
                default:
                    return { text: `  Command not found: "${cmd}"\n  Type "help" for available commands.\n`, cls: 'cx-error' };
            }
        },

        _typeResponse(text, cls) {
            if (!text || !els.terminalOutput) return;
            cls = cls || 'cx-response';
            const span = document.createElement('span');
            span.className = cls;
            els.terminalOutput.appendChild(span);
            let i = 0;
            clearTimeout(this._typingTimer);
            const type = () => {
                if (i < text.length) {
                    span.textContent += text[i];
                    i++;
                    this._scrollTerminal();
                    this._typingTimer = setTimeout(type, 12);
                }
            };
            type();
        },

        _printLine(text, cls) {
            if (!els.terminalOutput) return;
            const div = document.createElement('div');
            div.className = cls || '';
            div.textContent = text;
            els.terminalOutput.appendChild(div);
            this._scrollTerminal();
        },

        _scrollTerminal() {
            if (els.terminalBody) {
                els.terminalBody.scrollTop = els.terminalBody.scrollHeight;
            }
        }
    };

    // ========== PORTFOLIO TOUR ==========

    const Tour = {
        _stepIndex: 0,
        _sectionEls: {},

        init() {
            const mem = Memory.load();
            if (mem.tourCompleted || mem.visitCount > 1) return;
            // Map section elements
            const sections = document.querySelectorAll('section');
            if (sections[0]) this._sectionEls.hero = sections[0];
            SECTION_ORDER.slice(1).forEach(id => {
                const el = document.getElementById(id);
                if (el) this._sectionEls[id] = el;
            });

            // Show prompt after greeting delay
            setTimeout(() => {
                if (!state.visible || state.terminalOpen) return;
                this._showPrompt();
            }, 4000);
        },

        _showPrompt() {
            if (!els.tourPrompt) return;
            els.tourPrompt.classList.add('cortex-tour-visible');
            // Auto-dismiss after 5s
            state.tourDismissTimer = setTimeout(() => {
                this._dismiss();
            }, 5000);
        },

        _dismiss() {
            clearTimeout(state.tourDismissTimer);
            if (els.tourPrompt) els.tourPrompt.classList.remove('cortex-tour-visible');
            Memory.update(d => { d.tourCompleted = true; });
        },

        start() {
            clearTimeout(state.tourDismissTimer);
            if (els.tourPrompt) els.tourPrompt.classList.remove('cortex-tour-visible');
            state.tourActive = true;
            Speech.clear();
            this._stepIndex = 0;
            this._nextStep();
        },

        _nextStep() {
            if (this._stepIndex >= SECTION_ORDER.length) {
                this._finish();
                return;
            }
            const sectionId = SECTION_ORDER[this._stepIndex];
            const el = this._sectionEls[sectionId];
            if (!el) { this._stepIndex++; this._nextStep(); return; }

            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                Speech.show(TOUR_MESSAGES[sectionId] || sectionId, 2500);
                this._stepIndex++;
                setTimeout(() => this._nextStep(), 3000);
            }, 800);
        },

        _finish() {
            state.tourActive = false;
            Memory.update(d => { d.tourCompleted = true; });
            Speech.show('Tour complete. Enjoy exploring.', 3000);
        }
    };

    // ========== ACHIEVEMENTS ==========

    const Achievements = {
        DEFS: {
            explorer: { name: 'EXPLORER', desc: 'Visited every section', check: () => { const m = Memory.load(); return m.viewedSections.length >= 6; } },
            curious: { name: 'CURIOUS', desc: 'Opened Developer Mode', check: () => { const m = Memory.load(); return m.achievements.includes('curious'); } },
            researcher: { name: 'RESEARCHER', desc: 'Viewed every project', check: () => state.viewedProjects.size >= 4 }
        },
        _shown: new Set(),

        check() {
            Object.entries(this.DEFS).forEach(([key, def]) => {
                if (this._shown.has(key)) return;
                if (def.check()) {
                    this._shown.add(key);
                    Memory.update(d => {
                        if (!d.achievements.includes(key)) d.achievements.push(key);
                    });
                    Notifications.achievement(def.name, def.desc);
                }
            });
        }
    };

    // ========== LONG STAY INSPECTION ==========

    const Inspection = {
        init() {
            // Check every 30s if the visitor has spent >3 min
            state.sessionTimeInterval = setInterval(() => {
                if (!state.visible) return;
                const elapsed = Date.now() - state.startTime;
                if (elapsed > 180000 && !state.shownLongStayMsg) {
                    state.shownLongStayMsg = true;
                    Speech.show('Thanks for taking the time to explore my work.', 3500);
                }
            }, 30000);
        }
    };

    // ========== TAB VISIBILITY ==========

    function initVisibility() {
        document.addEventListener('visibilitychange', () => {
            state.tabVisible = !document.hidden;
            if (!state.tabVisible) {
                // Pause timers implicitly (RAF loop checks tabVisible)
            } else {
                state.lastActivity = Date.now();
                RandomScheduler._schedule();
            }
        });
    }

    // ========== SESSION TIME TRACKING ==========

    function trackSessionTime() {
        // Update total time every 10s
        setInterval(() => {
            if (state.tabVisible) {
                Memory.update(d => { d.totalTimeMs += 10000; });
                // Check 5-min curiosity message
                const mem = Memory.load();
                if (mem.totalTimeMs > 300000) {
                    // Handled by memory-based greeting on future visits
                }
            }
        }, 10000);
    }

    // ========== DOM CREATION ==========

    function createDOM() {
        // Notification container (top-right)
        els.notifications = document.createElement('div');
        els.notifications.className = 'cortex-notifications';
        els.notifications.setAttribute('aria-label', 'Cortex notifications');
        document.body.appendChild(els.notifications);

        // Main container (bottom-right)
        els.container = document.createElement('div');
        els.container.className = 'cortex-container cortex-hidden';
        els.container.setAttribute('aria-label', 'Cortex AI companion');
        els.container.setAttribute('role', 'complementary');

        // Robot wrapper (handles float animation)
        els.wrapper = document.createElement('div');
        els.wrapper.className = 'cortex-robot-wrapper';

        // Robot SVG
        els.wrapper.innerHTML = ROBOT_SVG;
        els.robotSvg = els.wrapper.querySelector('.cortex-robot-svg');

        // Speech bubble
        els.speech = document.createElement('div');
        els.speech.className = 'cortex-speech';
        els.speech.setAttribute('aria-live', 'polite');
        els.wrapper.appendChild(els.speech);

        // Particle container
        els.particleContainer = document.createElement('div');
        els.particleContainer.className = 'cortex-particle-container';
        els.wrapper.appendChild(els.particleContainer);

        // Mini icon
        els.miniIcon = document.createElement('span');
        els.miniIcon.className = 'cortex-mini-icon';
        els.wrapper.appendChild(els.miniIcon);

        // Tour prompt
        els.tourPrompt = document.createElement('div');
        els.tourPrompt.className = 'cortex-tour-prompt';
        els.tourPrompt.setAttribute('role', 'dialog');
        els.tourPrompt.setAttribute('aria-label', 'Portfolio tour prompt');
        els.tourPrompt.innerHTML =
            '<p>Need a quick tour?</p>' +
            '<div class="cortex-tour-buttons">' +
            '<button class="cortex-tour-btn" id="cortex-tour-yes">[YES]</button>' +
            '<button class="cortex-tour-btn cortex-tour-btn-skip" id="cortex-tour-skip">[SKIP]</button>' +
            '</div>';
        els.wrapper.appendChild(els.tourPrompt);

        els.container.appendChild(els.wrapper);
        document.body.appendChild(els.container);

        // Terminal overlay
        els.terminalOverlay = document.createElement('div');
        els.terminalOverlay.className = 'cortex-terminal-overlay';
        els.terminalOverlay.setAttribute('role', 'dialog');
        els.terminalOverlay.setAttribute('aria-label', 'Cortex developer terminal');
        els.terminalOverlay.innerHTML =
            '<div class="cortex-terminal">' +
            '<div class="cortex-terminal-header">' +
            '<span class="cortex-terminal-title">Cortex Terminal</span>' +
            '<button class="cortex-terminal-close" id="cortex-term-close">ESC</button>' +
            '</div>' +
            '<div class="cortex-terminal-body">' +
            '<div class="cortex-terminal-output"></div>' +
            '<div class="cortex-terminal-input-line">' +
            '<span class="cortex-terminal-prompt-label">cortex@portfolio:~$</span>' +
            '<input class="cortex-terminal-input" id="cortex-term-input" type="text" autocomplete="off" spellcheck="false" aria-label="Terminal input">' +
            '</div>' +
            '</div>' +
            '</div>';
        document.body.appendChild(els.terminalOverlay);

        els.terminalOutput = els.terminalOverlay.querySelector('.cortex-terminal-output');
        els.terminalBody = els.terminalOverlay.querySelector('.cortex-terminal-body');
        els.terminalInput = els.terminalOverlay.querySelector('#cortex-term-input');

        // Terminal event listeners
        els.terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                Terminal.handleCommand(els.terminalInput.value);
                els.terminalInput.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                Terminal.navigateHistory(-1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                Terminal.navigateHistory(1);
            }
        });

        document.getElementById('cortex-term-close').addEventListener('click', () => Terminal.close());
        els.terminalOverlay.addEventListener('click', (e) => {
            if (e.target === els.terminalOverlay) Terminal.close();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && state.terminalOpen) Terminal.close();
        });

        // Tour button listeners
        document.getElementById('cortex-tour-yes').addEventListener('click', () => Tour.start());
        document.getElementById('cortex-tour-skip').addEventListener('click', () => Tour._dismiss());
    }

    // ========== ENTRANCE SEQUENCE ==========

    function entrance() {
        // Set initial position (hero = bottom-right) BEFORE revealing
        PositionManager.moveTo('hero');
        els.container.classList.remove('cortex-hidden');

        // 1. Spark
        if (!state.reducedMotion) {
            const spark = document.createElement('div');
            spark.className = 'cortex-spark';
            els.wrapper.appendChild(spark);
            setTimeout(() => spark.remove(), 700);
        }

        // 2. Materialize robot after spark
        setTimeout(() => {
            if (els.robotSvg) els.robotSvg.classList.add('cortex-visible');
            state.visible = true;

            // 3. Start floating
            setTimeout(() => {
                if (els.wrapper) els.wrapper.classList.add('cortex-floating');
            }, 600);

            // 4. System notification
            Notifications.system('CORTEX ONLINE');

            // 5. Spawn entrance particles
            setTimeout(() => Particles.spawn(4), 300);

            // 6. Greeting based on memory
            setTimeout(() => {
                greet();
            }, 1500);
        }, state.reducedMotion ? 100 : 600);
    }

    function greet() {
        const mem = Memory.load();
        if (mem.visitCount <= 1) {
            Speech.show('Hello, Visitor.', 2500);
        } else if (mem.downloadedResume) {
            Speech.show('Good luck.', 2500);
        } else if (mem.totalTimeMs > 300000) {
            Speech.show('Curiosity detected.', 2500);
        } else if (mem.viewedProjects.length >= 4) {
            Speech.show('Everything indexed.', 2500);
        } else {
            Speech.show('Welcome back.', 2500);
        }
    }

    // ========== INITIALIZATION ==========

    function init() {
        if (state.initialized) return;
        state.initialized = true;

        // Detect capabilities
        state.isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;
        state.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Update visit memory
        Memory.update(d => {
            d.visitCount = (d.visitCount || 0) + 1;
            if (!d.firstVisit) d.firstVisit = new Date().toISOString();
            d.lastVisit = new Date().toISOString();
        });

        // Build DOM
        createDOM();

        // Init position manager resize listener
        PositionManager.initResize();

        // Init subsystems
        CursorTracker.init();
        SleepMode.init();
        Terminal.init();
        initVisibility();
        trackSessionTime();

        // Wait for hero section visibility, then entrance after 3s
        const heroSection = document.querySelector('section');
        if (!heroSection) { startEntrance(); return; }

        const heroObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !state.visible) {
                    state.entranceTimer = setTimeout(() => {
                        if (!state.visible) {
                            entrance();
                            // Start remaining subsystems after entrance
                            setTimeout(() => {
                                SectionObserver.init();
                                HoverReactions.init();
                                RandomScheduler.init();
                                IdleBlink.init();
                                Inspection.init();
                                Tour.init();
                            }, 2000);
                        }
                    }, 3000);
                } else if (!entry.isIntersecting && !state.visible) {
                    clearTimeout(state.entranceTimer);
                }
            });
        }, { threshold: 0.2 });

        heroObs.observe(heroSection);
    }

    // ========== BOOTSTRAP ==========

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
