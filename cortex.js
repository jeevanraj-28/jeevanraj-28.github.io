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
        hero: 'Cortex online.',
        about: 'Profile loaded.',
        experience: 'Service record.',
        projects: 'Projects on record.',
        skills: 'Capability matrix.',
        contact: 'Channel open.'
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

    // Holographic AI core: layered counter-rotating rings, tumbling orbits,
    // flickering circuit fragments and a bright core. Pure SVG + CSS animation.
    // Class hooks kept from the old robot: cortex-robot-svg, cortex-head-group
    // (tilts toward the cursor), cortex-pupil (core, tracks the cursor),
    // cortex-screen-overlay (scan line).
    function orbSVG(size, uid) {
        let seed = 7;
        const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
        let frags = '';
        for (let i = 0; i < 72; i++) {
            const a = rnd() * Math.PI * 2;
            const r = 19 + rnd() * 32;
            const x = (60 + Math.cos(a) * r).toFixed(1);
            const y = (60 + Math.sin(a) * r).toFixed(1);
            const w = (1 + rnd() * 4.5).toFixed(1);
            const h = (0.5 + rnd() * 1.1).toFixed(1);
            const deg = Math.round(a * 180 / Math.PI + 90);
            const col = rnd() > 0.75 ? COLORS.secondary : COLORS.primary;
            const op = (0.35 + rnd() * 0.6).toFixed(2);
            const flick = rnd() > 0.55 ? ` class="cx-flick" style="animation-delay:-${(rnd() * 3).toFixed(2)}s"` : '';
            frags += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${col}" opacity="${op}" transform="rotate(${deg} ${x} ${y})"${flick}/>`;
        }
        const P = COLORS.primary, S = COLORS.secondary;
        return `<svg class="cortex-robot-svg cortex-orb" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${size}" height="${size}" aria-hidden="true">
        <defs>
            <radialGradient id="cx-halo-${uid}">
                <stop offset="0" stop-color="${P}" stop-opacity="0.32"/>
                <stop offset="0.45" stop-color="${S}" stop-opacity="0.14"/>
                <stop offset="1" stop-color="${S}" stop-opacity="0"/>
            </radialGradient>
            <radialGradient id="cx-core-${uid}">
                <stop offset="0" stop-color="#ffffff" stop-opacity="1"/>
                <stop offset="0.35" stop-color="${P}" stop-opacity="0.9"/>
                <stop offset="1" stop-color="${P}" stop-opacity="0"/>
            </radialGradient>
        </defs>
        <circle class="cx-halo" cx="60" cy="60" r="60" fill="url(#cx-halo-${uid})"/>
        <g class="cortex-head-group">
            <g class="cx-ring cx-r1"><circle cx="60" cy="60" r="54" fill="none" stroke="${P}" stroke-width="1.1" stroke-dasharray="24 5 4 5 42 9 8 13 30 8 60 12" opacity="0.8"/></g>
            <g class="cx-ring cx-r2"><circle cx="60" cy="60" r="49" fill="none" stroke="${P}" stroke-width="2.6" stroke-dasharray="0.7 3.1" opacity="0.4"/></g>
            <g class="cx-gyro cx-g1"><g class="cx-tumble"><circle cx="60" cy="60" r="45" fill="none" stroke="${P}" stroke-width="0.7" opacity="0.55"/></g></g>
            <g class="cx-gyro cx-g2"><g class="cx-tumble"><circle cx="60" cy="60" r="45" fill="none" stroke="${S}" stroke-width="0.9" stroke-dasharray="14 4" opacity="0.7"/></g></g>
            <g class="cx-boost"><g class="cx-ring cx-r3"><circle cx="60" cy="60" r="40" fill="none" stroke="${S}" stroke-width="2.4" stroke-dasharray="58 22 16 28 40 87" opacity="0.9"/></g></g>
            <g class="cx-ring cx-frags">${frags}</g>
            <g class="cx-boost-rev"><g class="cx-ring cx-r4"><circle cx="60" cy="60" r="29" fill="none" stroke="${P}" stroke-width="1.6" stroke-dasharray="38 7 12 7 66 52" opacity="0.95"/></g></g>
            <g class="cx-ring cx-r5"><circle cx="60" cy="60" r="21" fill="none" stroke="${P}" stroke-width="0.6" stroke-dasharray="2 2" opacity="0.6"/></g>
            <circle class="cx-ripple" cx="60" cy="60" r="24" fill="none" stroke="${P}" stroke-width="1"/>
            <rect class="cortex-screen-overlay" x="14" y="59.5" width="92" height="1" fill="${P}"/>
        </g>
        <g class="cortex-pupil">
            <circle class="cx-core-glow" cx="60" cy="60" r="17" fill="url(#cx-core-${uid})"/>
            <circle class="cx-core-ring" cx="60" cy="60" r="10" fill="none" stroke="${P}" stroke-width="0.8" stroke-dasharray="9 3"/>
            <circle class="cx-core" cx="60" cy="60" r="5" fill="#effff7"/>
        </g>
    </svg>`;
    }

    const ROBOT_SVG = orbSVG(96, 'main').replace('width="96" height="96"', 'width="100%" height="100%"');

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
                chatUsed: false,
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
            if (els.robotSvg) els.robotSvg.classList.add('cortex-speaking');
            clearTimeout(state.speechTimer);
            state.speechTimer = setTimeout(() => {
                els.speech.classList.remove('cortex-speech-visible');
                if (els.robotSvg) els.robotSvg.classList.remove('cortex-speaking');
                setTimeout(() => this._next(), 300);
            }, duration);
        },

        clear() {
            this.queue = [];
            this.active = false;
            clearTimeout(state.speechTimer);
            if (els.speech) els.speech.classList.remove('cortex-speech-visible');
            if (els.robotSvg) els.robotSvg.classList.remove('cortex-speaking');
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
            Sound.chime();
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
            const robotCy = rect.top + rect.height / 2;
            const dx = state.cursorX - robotCx;
            const dy = state.cursorY - robotCy;
            const angle = Math.atan2(dy, dx);
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxShift = 5;
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
            // Docked: always top-right under the nav, where it never covers content.
            hero:       { xSide: 'right', ySide: 'bottom' },
            about:      { xSide: 'right', ySide: 'top'    },
            experience: { xSide: 'right', ySide: 'top'    },
            projects:   { xSide: 'right', ySide: 'top'    },
            skills:     { xSide: 'right', ySide: 'top'    },
            contact:    { xSide: 'right', ySide: 'top'    },
        },
        MARGIN_X: 40,
        MARGIN_Y_TOP: 110,
        MARGIN_Y_BOTTOM: 80,
        SMALL: 96,
        CORE_RATIO: 0.62,      // core size inside the hero HUD
        _slot: null,
        _slots: [],
        _hero: null,
        _slotSize: 0,
        _mode: null,           // 'hero' | 'dock'
        _last: null,
        _raf: 0,
        _focusTimer: null,

        // Corner position for a section (docked, small)
        _px(section) {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const rw = this.SMALL, rh = this.SMALL;
            const isMobile = vw < 768;
            const mx = isMobile ? 14 : this.MARGIN_X;
            const myTop = isMobile ? 80 : this.MARGIN_Y_TOP;
            const myBot = isMobile ? 20 : this.MARGIN_Y_BOTTOM;
            // On phones, stay bottom-right so the core never covers the nav or the text
            const pos = isMobile ? this.POSITIONS.hero : (this.POSITIONS[section] || this.POSITIONS.hero);
            const left = pos.xSide === 'left' ? mx : vw - rw - mx;
            const top  = pos.ySide === 'top'  ? myTop : vh - rh - myBot;
            return { left, top, size: this.SMALL, xSide: pos.xSide, ySide: pos.ySide };
        },

        // ---- Hero HUD: the big core lives in the empty space beside the hero text ----
        buildSlot() {
            const hero = document.querySelector('section');
            if (!hero) return;
            const slot = document.createElement('div');
            slot.className = 'cortex-hero-slot';
            slot.setAttribute('aria-hidden', 'true');
            const n = (window.CORTEX_KB && window.CORTEX_KB.projects.length) || 6;
            slot.innerHTML =
                '<div class="cx-hud-ring cx-hud-ring-1"></div>' +
                '<div class="cx-hud-ring cx-hud-ring-2"></div>' +
                '<div class="cx-hud-ticks"></div>' +
                '<div class="cx-hud-cross"></div>' +
                '<div class="cx-hud-label cx-hud-tl">CORTEX // PORTFOLIO AI</div>' +
                '<div class="cx-hud-label cx-hud-tr"><span class="cx-hud-dot"></span>ONLINE</div>' +
                '<div class="cx-hud-label cx-hud-bl">INDEX ' + n + ' PROJECTS · LIVE GITHUB<br><span class="cx-hud-focus">FOCUS ▸ RAG</span></div>' +
                '<div class="cx-hud-label cx-hud-br">› CLICK THE CORE</div>';
            hero.appendChild(slot);
            this._slot = slot;
            this._hero = hero;
            this._slots = [slot];
            this.layoutSlot();

            // Second station: the empty column under ABOUT_
            const aboutCol = document.querySelector('#about .reveal');
            if (aboutCol) {
                const a = document.createElement('div');
                a.className = 'cortex-hero-slot cortex-about-slot';
                a.setAttribute('aria-hidden', 'true');
                a.innerHTML =
                    '<div class="cx-hud-ring cx-hud-ring-1"></div>' +
                    '<div class="cx-hud-ring cx-hud-ring-2"></div>' +
                    '<div class="cx-hud-ticks"></div>' +
                    '<div class="cx-hud-cross"></div>' +
                    '<div class="cx-hud-label cx-hud-tl">PROFILE // AI · ML · DS</div>' +
                    '<div class="cx-hud-label cx-hud-br">› ASK ME ANYTHING</div>';
                aboutCol.appendChild(a);
                this._slots.push(a);
            }

            // Cycle the focus readout through Jeevan's domains
            const focus = slot.querySelector('.cx-hud-focus');
            const domains = ['RAG', 'LLM SYSTEMS', 'NLP', 'COMPUTER VISION', 'DATA SCIENCE', 'ML EVALUATION'];
            let i = 0;
            setInterval(() => {
                if (document.hidden || this._mode !== 'hero') return;
                i = (i + 1) % domains.length;
                focus.textContent = 'FOCUS ▸ ' + domains[i];
                focus.classList.remove('cx-hud-flick');
                void focus.offsetWidth;
                focus.classList.add('cx-hud-flick');
            }, 1800);
        },

        layoutSlot() {
            const slot = this._slot, hero = this._hero;
            if (!slot) return;
            const vw = window.innerWidth;
            const heroRect = hero.getBoundingClientRect();
            const para = hero.querySelector('p.font-body-lg');
            const btns = hero.querySelectorAll('.reveal > div.flex > *');
            let right = para ? para.getBoundingClientRect().right : 0;
            btns.forEach(b => { right = Math.max(right, b.getBoundingClientRect().right); });
            const avail = vw - right - 90;
            const size = Math.floor(Math.min(470, avail, heroRect.height * 0.62));
            if (vw < 1100 || size < 210) {
                this._slotSize = 0;
                slot.style.display = 'none';
                return;
            }
            this._slotSize = size;
            const content = para ? para.getBoundingClientRect() : heroRect;
            const cx = right + 50 + avail / 2;
            // Centre the core in the visible hero (not on the paragraph) so it reads as the main figure
            const visibleH = Math.min(heroRect.height, window.innerHeight);
            const cy = heroRect.top + window.scrollY * 0 + visibleH * 0.48;
            void content;
            slot.style.display = 'block';
            slot.style.width = size + 'px';
            slot.style.height = size + 'px';
            slot.style.left = (cx - size / 2 - heroRect.left) + 'px';
            slot.style.top = (cy - size / 2 - heroRect.top) + 'px';
        },

        // The station nearest the middle of the screen, if one is in view
        _activeSlot() {
            const vh = window.innerHeight;
            let best = null, bestD = Infinity;
            this._slots.forEach(sl => {
                if (!sl || sl.offsetParent === null) return;           // display:none
                if (sl === this._slot && !this._slotSize) return;
                const r = sl.getBoundingClientRect();
                if (r.width < 200) return;
                if (r.bottom > vh * 0.38 && r.top < vh * 0.72) {
                    const d = Math.abs(r.top + r.height / 2 - vh / 2);
                    if (d < bestD) { bestD = d; best = sl; }
                }
            });
            return best;
        },

        _inHero() { return !!this._activeSlot(); },

        _target(section) {
            const sl = this._activeSlot();
            if (sl) {
                const r = sl.getBoundingClientRect();
                const s = Math.round(r.width * this.CORE_RATIO);
                return { left: r.left + (r.width - s) / 2, top: r.top + (r.height - s) / 2, size: s, mode: 'hero', slot: sl };
            }
            return Object.assign(this._px(section), { mode: 'dock', slot: null });
        },

        _apply(t, animate) {
            const c = els.container;
            if (!c) return;
            c.classList.toggle('cx-follow', !animate);
            c.style.left = t.left + 'px';
            c.style.top = t.top + 'px';
            c.style.right = 'auto';
            c.style.bottom = 'auto';
            if (els.wrapper) {
                els.wrapper.style.width = t.size + 'px';
                els.wrapper.style.height = t.size + 'px';
            }
            const moved = this._last && (Math.abs(this._last.left - t.left) + Math.abs(this._last.top - t.top) > 60 || Math.abs(this._last.size - t.size) > 8);
            if (animate && moved && state.visible) this.warp();
            c.classList.toggle('cortex-hero-mode', t.mode === 'hero');
            c.classList.toggle('cx-side-left', t.mode === 'dock' && t.xSide === 'left');
            c.classList.toggle('cx-edge-top', t.mode === 'dock' && t.ySide === 'top');
            if (t.mode === 'dock' && Teaser._pending) { Teaser._pending = false; setTimeout(() => Teaser.show(), 1400); }
            this._slots.forEach(sl => sl.classList.toggle('cx-slot-active', sl === t.slot));
            this._mode = t.mode;
            this._last = t;
        },

        moveTo(section) {
            this._apply(this._target(section || state.currentSection || 'hero'), true);
        },

        // Movement effect: inner rings spin up, halo flares, scan line, soft sweep
        warp() {
            if (!els.robotSvg) return;
            const now = Date.now();
            if (now - (this._warpAt || 0) < 400) return;
            this._warpAt = now;
            els.robotSvg.classList.remove('cortex-warping');
            void els.robotSvg.getBoundingClientRect();
            els.robotSvg.classList.add('cortex-warping');
            clearTimeout(this._focusTimer);
            this._focusTimer = setTimeout(() => els.robotSvg && els.robotSvg.classList.remove('cortex-warping'), 1000);
            Sound.warp();
        },

        _onScroll() {
            if (this._raf) return;
            this._raf = requestAnimationFrame(() => {
                this._raf = 0;
                const t = this._target(state.currentSection);
                const same = this._last && t.mode === this._last.mode && t.slot === this._last.slot;
                if (same && t.mode === 'hero') {
                    this._apply(t, false);                        // ride along with the station
                } else if (!same) {
                    this._apply(t, true);                         // fly between stations / dock
                }
            });
        },

        _onResize() {
            this.layoutSlot();
            this._apply(this._target(state.currentSection || 'hero'), false);
        },

        initResize() {
            this.buildSlot();
            window.addEventListener('resize', () => this._onResize(), { passive: true });
            window.addEventListener('scroll', () => this._onScroll(), { passive: true });
            const relayout = () => this._onResize();
            window.addEventListener('load', relayout);
            if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
        }
    };

    // ========== SOUND: synthesized UI tones (no voice) ==========
    // Web Audio only. Starts after the visitor's first click or key press
    // (browser autoplay rules); mute is remembered per browser.

    const Sound = {
        KEY: 'cortex_sound',
        ctx: null,
        master: null,
        _booted: false,
        _lastHover: 0,

        enabled() { try { return localStorage.getItem(this.KEY) !== 'off'; } catch { return true; } },
        setEnabled(on) { try { localStorage.setItem(this.KEY, on ? 'on' : 'off'); } catch {} },

        init() {
            const unlock = () => this.unlock();
            ['pointerdown', 'keydown', 'touchstart'].forEach(ev => document.addEventListener(ev, unlock, { passive: true }));
        },

        unlock() {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            if (!this.ctx) {
                try {
                    this.ctx = new AC();
                    this.master = this.ctx.createGain();
                    this.master.gain.value = 0.12;
                    this.master.connect(this.ctx.destination);
                } catch { this.ctx = null; return; }
            }
            if (this.ctx.state === 'suspended') this.ctx.resume();
            if (!this._booted && state.visible) {
                this._booted = true;
                setTimeout(() => this.boot(), 60);
            }
        },

        _ok() { return this.ctx && this.ctx.state === 'running' && this.enabled() && !document.hidden; },

        tone(freq, dur, opts) {
            if (!this._ok()) return;
            const o = Object.assign({ type: 'sine', gain: 0.5, at: 0, to: null, attack: 0.006 }, opts || {});
            const t = this.ctx.currentTime + o.at;
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = o.type;
            osc.frequency.setValueAtTime(freq, t);
            if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(o.gain, t + o.attack);
            g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
            osc.connect(g);
            g.connect(this.master);
            osc.start(t);
            osc.stop(t + dur + 0.03);
        },

        boot()    { this.tone(220, 0.42, { type: 'triangle', to: 880, gain: 0.22, attack: 0.04 }); this.tone(1320, 0.1, { at: 0.4, gain: 0.25 }); this.tone(1760, 0.14, { at: 0.5, gain: 0.2 }); },
        open()    { this.tone(420, 0.15, { type: 'triangle', to: 980, gain: 0.45 }); this.tone(1320, 0.09, { at: 0.13, gain: 0.3 }); },
        close()   { this.tone(900, 0.17, { type: 'triangle', to: 300, gain: 0.35 }); },
        send()    { this.tone(1046, 0.05, { type: 'square', gain: 0.12 }); },
        receive() { this.tone(660, 0.07, { gain: 0.35 }); this.tone(990, 0.1, { at: 0.07, gain: 0.3 }); },
        tick()    { this.tone(2600, 0.012, { type: 'square', gain: 0.035 }); },
        deny()    { this.tone(320, 0.08, { type: 'square', gain: 0.14 }); this.tone(250, 0.11, { at: 0.11, type: 'square', gain: 0.14 }); },
        warp()    { this.tone(160, 0.38, { type: 'triangle', to: 640, gain: 0.16, attack: 0.06 }); this.tone(1480, 0.06, { at: 0.34, gain: 0.12 }); },
        ping()    { this.tone(1568, 0.08, { gain: 0.25 }); this.tone(2093, 0.12, { at: 0.08, gain: 0.2 }); },
        chime()   { [784, 988, 1175].forEach((f, i) => this.tone(f, 0.13, { at: i * 0.08, gain: 0.25 })); },
        hover() {
            const now = Date.now();
            if (now - this._lastHover < 1200) return;
            this._lastHover = now;
            this.tone(1760, 0.035, { gain: 0.1 });
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
            // Reposition, then play the warp so every section change has a movement cue
            PositionManager.moveTo(section);
            if (state.visible) PositionManager.warp();

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
                    const NP = window.CORTEX_KB ? window.CORTEX_KB.projects.length : 6;
                    state.viewedProjects.add(i % NP);
                    Memory.update(d => {
                        const name = window.CORTEX_KB && window.CORTEX_KB.projects[i % NP].id;
                        if (name && !d.viewedProjects.includes(name)) {
                            d.viewedProjects.push(name);
                        }
                    });
                    const kbp = window.CORTEX_KB && window.CORTEX_KB.projects[i % NP];
                    timer1 = setTimeout(() => {
                        if (!Chat.open && kbp) Speech.show(kbp.hook, 3200);
                    }, 900);
                    timer2 = setTimeout(() => {
                        if (!Chat.open) Speech.show('Tap the core for the full brief.', 2200);
                    }, 4400);
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
                        '  clear     Clear terminal\n' +
                        '  Anything else goes to the agent,\n' +
                        '  e.g. show me your rag work\n'
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
                        '  │  B.E. AI & DS, Mysore Uni      │\n' +
                        '  │  Focus: DL · NLP · CV          │\n' +
                        '  │  CGPA: 9 / 10                  │\n' +
                        '  └───────────────────────────────┘\n'
                    };
                case 'projects':
                    return { text:
                        '  ┌────────────────────────────────────┐\n' +
                        '  │  01 ▸ Lumina RAG Assistant    [★]  │\n' +
                        '  │      Private document AI           │\n' +
                        '  │                                    │\n' +
                        '  │  02 ▸ Clinical NLP Demo       [✓]  │\n' +
                        '  │      Notes to structured fields    │\n' +
                        '  │                                    │\n' +
                        '  │  03 ▸ Disaster Segmentation   [✓]  │\n' +
                        '  │      Drone-image flood mapping     │\n' +
                        '  │                                    │\n' +
                        '  │  04 ▸ CafeCritic              [✓]  │\n' +
                        '  │      Content + rating recommender  │\n' +
                        '  │                                    │\n' +
                        '  │  05 ▸ Cortex Intelligence     [~]  │\n' +
                        '  │      Local-first system observer   │\n' +
                        '  │                                    │\n' +
                        '  │  06 ▸ CARE Healthcare AI      [K]  │\n' +
                        '  │      Kinetrix internship work      │\n' +

                        '  └────────────────────────────────────┘\n'
                    };
                case 'skills':
                    return { text:
                        '  _LANGUAGES    Python · SQL\n' +
                        '  _ML/AI        PyTorch · Scikit-learn · Hugging Face · OpenCV\n' +
                        '  _LLM/RAG      RAG · FAISS · Ollama · Embeddings\n' +
                        '  _SERVING      FastAPI · Docker · Celery · Git\n'
                    };
                case 'resume':
                    return {
                        text: '  Exporting resume...\n  Opening in new tab.\n',
                        action: () => {
                            Memory.update(d => { d.downloadedResume = true; });
                            setTimeout(() => window.open('Jeevan_Raj_M_AI_ML_Engineer_Resume.pdf', '_blank'), 500);
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
                    if (window.CortexAgent) {
                        return {
                            text: '',
                            action: () => this._printLine('  searching sources...', 'cx-dim') || window.CortexAgent.ask(cmd).then(a => {
                                setTimeout(() => this._typeResponse('  ' + a.text.replace(/\n/g, '\n  ') + '\n' +
                                    (a.source && a.source.label ? '  [src: ' + a.source.label + ']\n' : ''), 'cx-response'), 300);
                            })
                        };
                    }
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
            // Map section elements (the tour can also be started from the chat)
            const sections = document.querySelectorAll('section');
            if (sections[0]) this._sectionEls.hero = sections[0];
            SECTION_ORDER.slice(1).forEach(id => {
                const el = document.getElementById(id);
                if (el) this._sectionEls[id] = el;
            });
            // Instead of a tour prompt, invite the visitor to ask Cortex
            setTimeout(() => Teaser.show(), 3500);
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
            researcher: { name: 'RESEARCHER', desc: 'Viewed every project', check: () => state.viewedProjects.size >= (window.CORTEX_KB ? window.CORTEX_KB.projects.length : 6) }
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
                    Speech.show('Questions? Tap the core.', 3500);
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

    // ========== CHAT AGENT (click the robot) ==========
    // UI for window.CortexAgent (cortex-agent.js). Answers are retrieved
    // from cortex-kb.js and live GitHub data; nothing is generated.

    const Chat = {
        open: false,
        busy: false,
        _greeted: false,
        _focusTimer: null,
        get PROJECT_ORDER() { return window.CORTEX_KB ? window.CORTEX_KB.projects.map(p => p.id) : []; },

        build() {
            const panel = document.createElement('div');
            panel.className = 'cortex-chat';
            panel.setAttribute('role', 'dialog');
            panel.setAttribute('aria-label', 'Ask Cortex about Jeevan');
            panel.innerHTML =
                '<div class="cortex-chat-header">' +
                    '<div class="cortex-chat-id">' +
                        '<div class="cortex-chat-orb">' + orbSVG(44, 'chat') + '</div>' +
                        '<div><div class="cortex-chat-title">CORTEX</div>' +
                        '<div class="cortex-chat-status"><span class="cortex-chat-dot"></span><span class="cortex-chat-state">ONLINE</span> · ' + ((window.CORTEX_KB && window.CORTEX_KB.projects.length) || 6) + ' PROJECTS</div></div>' +
                    '</div>' +
                    '<div class="cortex-chat-ctrls"><button class="cortex-chat-sound" type="button" aria-label="Toggle sound effects"></button>' +
                    '<button class="cortex-chat-close" type="button" aria-label="Close chat">ESC</button></div>' +
                '</div>' +
                '<div class="cortex-chat-sub">Sourced from this site + live GitHub · nothing invented</div>' +
                '<div class="cortex-chat-log" aria-live="polite"><div class="cortex-chat-chips"></div></div>' +
                '<form class="cortex-chat-form" autocomplete="off">' +
                    '<span class="cortex-chat-caret" aria-hidden="true">&gt;</span>' +
                    '<input class="cortex-chat-input" type="text" maxlength="300" placeholder="Ask about RAG, ML, projects, skills…" aria-label="Your question">' +
                    '<button class="cortex-chat-send" type="submit" aria-label="Send">↵</button>' +
                '</form>';
            const backdrop = document.createElement('div');
            backdrop.className = 'cortex-backdrop';
            backdrop.setAttribute('aria-hidden', 'true');
            backdrop.addEventListener('click', () => this.close());
            document.body.appendChild(backdrop);
            els.backdrop = backdrop;
            document.body.appendChild(panel);
            els.chat = panel;
            els.chatLog = panel.querySelector('.cortex-chat-log');
            els.chatChips = panel.querySelector('.cortex-chat-chips');
            els.chatInput = panel.querySelector('.cortex-chat-input');
            els.chatOrb = panel.querySelector('.cortex-chat-orb .cortex-robot-svg');
            els.chatOrb.classList.add('cortex-visible');
            els.chatState = panel.querySelector('.cortex-chat-state');

            panel.querySelector('.cortex-chat-close').addEventListener('click', () => this.close());
            const snd = panel.querySelector('.cortex-chat-sound');
            const paint = () => { const on = Sound.enabled(); snd.textContent = on ? 'SFX ON' : 'SFX OFF'; snd.setAttribute('aria-pressed', on); snd.classList.toggle('cx-off', !on); };
            paint();
            snd.addEventListener('click', () => { Sound.setEnabled(!Sound.enabled()); paint(); Sound.ping(); });
            panel.querySelector('.cortex-chat-form').addEventListener('submit', (e) => {
                e.preventDefault();
                const q = els.chatInput.value;
                els.chatInput.value = '';
                this.ask(q);
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.open && !state.terminalOpen) this.close();
            });

            // The robot becomes the button that opens the chat
            els.wrapper.setAttribute('role', 'button');
            els.wrapper.setAttribute('tabindex', '0');
            els.wrapper.setAttribute('aria-label', 'Ask Cortex about Jeevan’s work');
            els.wrapper.addEventListener('click', (e) => {
                if (e.target.closest('.cortex-tour-prompt')) return;
                this.toggle();
            });
            els.wrapper.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.toggle(); }
            });
            els.wrapper.addEventListener('mouseenter', () => Sound.hover());
        },

        toggle() { this.open ? this.close() : this.show(); },

        show() {
            if (!els.chat || !window.CortexAgent) return;
            this.open = true;
            Speech.clear();
            if (els.tourPrompt && els.tourPrompt.classList.contains('cortex-tour-visible')) Tour._dismiss();
            Teaser.hide();
            Sound.open();
            Memory.update(d => { d.chatUsed = true; });
            if (els.askTag) els.askTag.classList.add('cortex-ask-tag-used');
            els.chat.classList.add('cortex-chat-open');
            if (els.backdrop) els.backdrop.classList.add('cortex-backdrop-on');
            document.documentElement.classList.add('cortex-focus-mode');
            els.container.classList.add('cortex-chatting');
            if (state.sleeping) SleepMode.wake();
            if (!this._greeted) {
                this._greeted = true;
                this.busy = true;
                this._bot({
                    text: 'Cortex online. I track everything Jeevan has built: AI, ML, data science, RAG, NLP, vision. Where do you want to start?',
                    source: null, actions: [], chips: window.CortexAgent.suggested
                }, () => this._idle());
            }
            setTimeout(() => els.chatInput.focus({ preventScroll: true }), 150);
        },

        close() {
            if (!this.open) return;
            this.open = false;
            Sound.close();
            if (els.chat) els.chat.classList.remove('cortex-chat-open');
            if (els.backdrop) els.backdrop.classList.remove('cortex-backdrop-on');
            document.documentElement.classList.remove('cortex-focus-mode');
            if (els.container) els.container.classList.remove('cortex-chatting');
        },

        async ask(q) {
            q = (q || '').trim();
            if (!q || !window.CortexAgent) return;
            if (this.busy) { this._pending = q; return; }
            if (/\b(tour|walk me through|show me around|guide me)\b/i.test(q)) {
                this._line('cortex-msg cortex-msg-user', q);
                this._line('cortex-msg cortex-msg-bot', 'Starting the tour. Follow the core.');
                setTimeout(() => { this.close(); Tour.start(); }, 700);
                return;
            }
            this.busy = true;
            this._line('cortex-msg cortex-msg-user', q);
            Sound.send();
            this._setChips([]);
            const thinking = this._line('cortex-chat-thinking', 'scanning sources…');
            this._mode('thinking');
            let answer;
            try { answer = await window.CortexAgent.ask(q); }
            catch { answer = { text: 'Signal lost. Try again, or reach Jeevan directly.', source: null, actions: [], chips: [] }; }
            thinking.remove();
            this._bot(answer, () => this._idle());
        },

        _idle() {
            this._mode('online');
            this.busy = false;
            if (this._pending) { const q = this._pending; this._pending = null; setTimeout(() => this.ask(q), 150); }
        },

        _mode(m) {
            if (!els.chatOrb) return;
            els.chatOrb.classList.toggle('cortex-thinking', m === 'thinking');
            els.chatOrb.classList.toggle('cortex-speaking', m === 'speaking');
            els.chatState.textContent = m === 'thinking' ? 'SEARCHING' : m === 'speaking' ? 'RESPONDING' : 'ONLINE';
        },

        _line(cls, text) {
            const div = document.createElement('div');
            div.className = cls;
            div.textContent = text;
            els.chatLog.insertBefore(div, els.chatChips);
            els.chatLog.scrollTop = els.chatLog.scrollHeight;
            return div;
        },

        _bot(a, done) {
            const msg = document.createElement('div');
            msg.className = 'cortex-msg cortex-msg-bot';
            const body = document.createElement('div');
            body.className = 'cortex-msg-text';
            msg.appendChild(body);
            els.chatLog.insertBefore(msg, els.chatChips);
            const extras = document.createElement('div');
            extras.className = 'cortex-msg-extras';
            const finish = () => {
                body.textContent = a.text;
                msg.appendChild(extras);
                els.chatLog.scrollTop = els.chatLog.scrollHeight;
                (a.actions || []).filter(x => x.auto).forEach(x => this._run(x));
                this._setChips(a.chips || []);
                if (done) done();
            };
            const text = a.text || '';
            if (state.reducedMotion || text.length < 2) {
                this._fill(extras, a);
                finish();
                return;
            }
            this._fill(extras, a);
            if (a.source && a.source.label === 'No matching source') Sound.deny(); else Sound.receive();
            this._mode('speaking');
            let ticks = 0;
            const step = Math.max(2, Math.ceil(text.length / 45)); // ~0.75s for any length
            let i = 0;
            const tick = () => {
                // Background tabs throttle timers: finish at once instead of stalling
                i = document.hidden ? text.length : Math.min(text.length, i + step);
                if (++ticks % 3 === 0) Sound.tick();
                body.textContent = text.slice(0, i);
                els.chatLog.scrollTop = els.chatLog.scrollHeight;
                if (i < text.length) setTimeout(tick, 16);
                else finish();
            };
            setTimeout(tick, 16);
        },

        _fill(msg, a) {

            if (a.source && a.source.label) {
                const src = document.createElement(a.source.href ? 'a' : 'div');
                src.className = 'cortex-msg-src';
                src.textContent = 'src: ' + a.source.label;
                if (a.source.href) {
                    src.href = a.source.href;
                    if (a.source.href.charAt(0) !== '#') { src.target = '_blank'; src.rel = 'noopener'; }
                    else src.addEventListener('click', (e) => { e.preventDefault(); this._scroll(a.source.href.slice(1)); });
                }
                msg.appendChild(src);
            }

            const acts = (a.actions || []).filter(x => !x.auto);
            if (acts.length) {
                const row = document.createElement('div');
                row.className = 'cortex-msg-actions';
                acts.forEach(act => {
                    const b = document.createElement('button');
                    b.type = 'button';
                    b.className = 'cortex-act';
                    b.textContent = act.label;
                    b.addEventListener('click', () => this._run(act, b));
                    row.appendChild(b);
                });
                msg.appendChild(row);
            }
        },

        _setChips(chips) {
            els.chatChips.innerHTML = '';
            chips.slice(0, 4).forEach(c => {
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'cortex-chip';
                b.textContent = c;
                b.addEventListener('click', () => this.ask(c));
                els.chatChips.appendChild(b);
            });
        },

        _run(act, btn) {
            switch (act.kind) {
                case 'scroll': this._scroll(act.value); break;
                case 'open':
                    if (/resume/i.test(act.value)) Memory.update(d => { d.downloadedResume = true; });
                    if (act.value.indexOf('mailto:') === 0) window.location.href = act.value;
                    else window.open(act.value, '_blank', 'noopener');
                    break;
                case 'copy': {
                    const done = () => { if (btn) btn.textContent = 'Copied ✓'; };
                    const fail = () => { if (btn) btn.textContent = act.value; };
                    try { navigator.clipboard.writeText(act.value).then(done, fail); } catch { fail(); }
                    break;
                }
                case 'focus': this._focusProjects(act.value); break;
                case 'ask': this.ask(act.value); break;
            }
        },

        _scroll(id) {
            const el = id === 'top' ? document.body : document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: state.reducedMotion ? 'auto' : 'smooth', block: 'start' });
            this.close();
        },

        // Stop the marquee on the first matching card and outline every match.
        _focusProjects(ids) {
            const section = document.getElementById('projects');
            const track = section && section.querySelector('.marquee-content');
            if (!track) return;
            const n = this.PROJECT_ORDER.length;
            const cards = [...track.children];
            const first = cards.slice(0, n).find((c, i) => ids.includes(this.PROJECT_ORDER[i]));
            if (!first) return;
            clearTimeout(this._focusTimer);
            cards.forEach((c, i) => c.classList.toggle('cortex-card-focus', ids.includes(this.PROJECT_ORDER[i % n])));
            const shift = Math.min(first.offsetLeft, track.scrollWidth / 2);
            track.style.animation = 'none';
            track.style.transition = state.reducedMotion ? 'none' : 'transform 0.6s ease';
            track.style.transform = 'translateX(-' + shift + 'px)';
            section.scrollIntoView({ behavior: state.reducedMotion ? 'auto' : 'smooth', block: 'start' });
            this.close();
            Speech.show('Ask again any time.', 2200);
            this._focusTimer = setTimeout(() => {
                cards.forEach(c => c.classList.remove('cortex-card-focus'));
                track.style.transition = '';
                track.style.transform = '';
                track.style.animation = '';
            }, 12000);
        }
    };

    // ========== TEASER: one-tap questions so visitors start using Cortex ==========

    const Teaser = {
        QUESTIONS: ['Show me his RAG work', 'Best project?', 'Does he know PyTorch?'],
        _timer: null,

        build() {
            const t = document.createElement('div');
            t.className = 'cortex-teaser';
            t.setAttribute('role', 'dialog');
            t.setAttribute('aria-label', 'Ask Cortex a question');
            t.innerHTML = '<button type="button" class="cortex-teaser-x" aria-label="Dismiss">×</button>' +
                '<p class="cortex-teaser-title">CORTEX ONLINE</p>' +
                '<p class="cortex-teaser-body">I know everything Jeevan has built. Try one:</p>' +
                '<div class="cortex-teaser-qs"></div>';
            const qs = t.querySelector('.cortex-teaser-qs');
            this.QUESTIONS.forEach(q => {
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'cortex-teaser-q';
                b.textContent = q;
                b.addEventListener('click', (e) => { e.stopPropagation(); this.hide(); Chat.show(); setTimeout(() => Chat.ask(q), 650); });
                qs.appendChild(b);
            });
            t.querySelector('.cortex-teaser-x').addEventListener('click', (e) => { e.stopPropagation(); this.hide(true); });
            t.addEventListener('click', (e) => e.stopPropagation());
            els.wrapper.appendChild(t);
            els.teaser = t;
        },

        show() {
            const mem = Memory.load();
            let seen = false;
            try { seen = sessionStorage.getItem('cortex_teaser') === '1'; } catch {}
            if (mem.chatUsed || seen || Chat.open || state.terminalOpen || state.tourActive || !state.visible || !els.teaser) return;
            if (PositionManager._mode === 'hero') { this._pending = true; return; }
            Speech.clear();
            els.teaser.classList.add('cortex-teaser-visible');
            Sound.ping();
            if (els.robotSvg) {
                els.robotSvg.classList.add('cortex-speaking');
                setTimeout(() => els.robotSvg && els.robotSvg.classList.remove('cortex-speaking'), 1600);
            }
            clearTimeout(this._timer);
            this._timer = setTimeout(() => this.hide(), 16000);
        },

        hide(byUser) {
            clearTimeout(this._timer);
            if (els.teaser) els.teaser.classList.remove('cortex-teaser-visible');
            try { sessionStorage.setItem('cortex_teaser', '1'); } catch {}
            if (byUser) Memory.update(d => { d.tourCompleted = true; });
        }
    };

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

        Chat.build();
        Teaser.build();

        // Always-visible label until the visitor has used the chat
        els.askTag = document.createElement('span');
        els.askTag.className = 'cortex-ask-tag';
        els.askTag.textContent = 'ASK CORTEX';
        if (Memory.load().chatUsed) els.askTag.classList.add('cortex-ask-tag-used');
        els.wrapper.appendChild(els.askTag);

        // Focus-area tags ask Cortex directly
        document.querySelectorAll('[data-cortex-ask]').forEach(el => {
            el.addEventListener('click', () => { Chat.show(); setTimeout(() => Chat.ask(el.getAttribute('data-cortex-ask')), 500); });
        });

        // Any element with data-cortex-open opens the chat (hero button)
        document.querySelectorAll('[data-cortex-open]').forEach(el => {
            el.addEventListener('click', (e) => { e.preventDefault(); Chat.show(); });
        });

        // "/" opens the chat from anywhere
        document.addEventListener('keydown', (e) => {
            if (e.key !== '/' || Chat.open || state.terminalOpen) return;
            const t = e.target;
            if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
            e.preventDefault();
            Chat.show();
        });
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
        setTimeout(() => { if (!Chat.open) Speech.show('Tap the core. Ask me about Jeevan.', 3000); }, 3200);
        const mem = Memory.load();
        if (mem.visitCount <= 1) {
            Speech.show('Cortex online.', 2500);
        } else if (mem.downloadedResume) {
            Speech.show('Good luck.', 2500);
        } else if (mem.totalTimeMs > 300000) {
            Speech.show('Curiosity detected.', 2500);
        } else if (window.CORTEX_KB && mem.viewedProjects.length >= window.CORTEX_KB.projects.length) {
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
        Sound.init();
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
                    }, 1200);
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
