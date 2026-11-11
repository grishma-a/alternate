/* script.js (font fix): fixes digit and punctuation height in your handwriting font.
 * Every page loads this as the last script. To nudge by hand, edit OVERRIDE below (or try it live
 * in the browser console:  fontFix.set({ numDown: 0.5, punctUp: 0.4 }) ). */
(function () {
    /* ===== settings ===== */
    const FONT = 'Numbers-Regular';                 // the font-family name in your @font-face (NOT the file name)
    const DIGIT_GAP = -0.3;
    const OVERRIDE = {
        numDown: 0.6,      // em to push digits DOWN: bigger = lower, negative = higher (null = auto)
        punctUp: 0.3
    };    // em to lift . , ; : ! ? UP: bigger = higher (null = auto)
    /* Nudge individual digits, in em. Positive = RAISE that digit. Add more like { '2': 0.08, '7': -0.04 } */
    const DIGIT_TWEAK = { '2': 0.08 };
    /* ==================== */

    const SAMPLE = '0123456789.,;:!?';     // makes the browser load every font file used for digits/punctuation
    const SKIP = /^(SCRIPT|STYLE|TEXTAREA|INPUT|OPTION|CANVAS|NOSCRIPT)$/;
    const api = window.fontFix = { numDown: 0, punctUp: 0, set, refresh: () => process(document.body) };

    const st = document.createElement('style');
    st.textContent = '.ff-n{position:relative;top:calc(var(--ff-num,0em) + var(--ff-d,0em))}.ff-n+.ff-n{margin-left:var(--ff-gap,0em)}.ff-p{position:relative;top:var(--ff-punct,0em)}';
    document.head.appendChild(st);

    function applyTweak(s) { const v = DIGIT_TWEAK[s.textContent]; s.style.setProperty('--ff-d', (v ? -v : 0) + 'em'); }
    api.tweak = o => { Object.assign(DIGIT_TWEAK, o); document.querySelectorAll('.ff-n').forEach(applyTweak); };  // live: fontFix.tweak({'2':.1})

    api.gap = g => document.documentElement.style.setProperty('--ff-gap', g + 'em');   // live: fontFix.gap(-.4)
    api.gap(DIGIT_GAP);

    function set(o) {
        if (o.numDown != null) api.numDown = o.numDown;
        if (o.punctUp != null) api.punctUp = o.punctUp;
        const r = document.documentElement.style;
        r.setProperty('--ff-num', api.numDown + 'em');       // positive top = down
        r.setProperty('--ff-punct', (-api.punctUp) + 'em');  // negative top = up
    }

    function calibrate() {
        try {
            const SZ = 200, c = document.createElement('canvas').getContext('2d');
            if (!c) return;
            c.font = SZ + 'px "' + FONT + '"'; c.textBaseline = 'alphabetic';
            const bottom = ch => c.measureText(ch).actualBoundingBoxDescent;     // +: below baseline, -: floating above
            const med = a => a.sort((x, y) => x - y)[a.length >> 1];
            const clamp = v => Math.max(-1.5, Math.min(1.5, v));
            const dDigit = med(['0', '1', '2', '6', '8'].map(bottom));
            const dPunct = med(['.', ':'].map(bottom));
            if (isFinite(dDigit) && isFinite(dPunct)) set({ numDown: clamp(-dDigit / SZ), punctUp: clamp(dPunct / SZ) });
        } catch (e) { }
    }

    const mk = (cls, t) => { const s = document.createElement('span'); s.className = cls; s.textContent = t; return s; };
    function process(root) {
        try {
            if (root && root.nodeType === 3) root = root.parentNode;
            if (!root || root.nodeType !== 1) return;
            const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), list = [];
            while (w.nextNode()) {
                const n = w.currentNode, p = n.parentNode;
                if (!p || SKIP.test(p.nodeName) || p.classList.contains('ff-n') || p.classList.contains('ff-p') ||
                    (p.closest && p.closest('[data-nofix]'))) continue;
                if (/[\d.,;:!?]/.test(n.nodeValue)) list.push(n);
            }
            list.forEach(n => {
                const f = document.createDocumentFragment();
                n.nodeValue.split(/(\d|[.,;:!?]+)/).forEach(part => {
                    if (!part) return;
                    if (/^\d$/.test(part)) { const s = mk('ff-n', part); applyTweak(s); f.append(s); }
                    else if (/^[.,;:!?]+$/.test(part)) f.append(mk('ff-p', part));
                    else f.append(part);
                });
                n.replaceWith(f);
            });
        } catch (e) { }
    }

    let queue = new Set(), scheduled = false;
    new MutationObserver(ms => {
        ms.forEach(m => { if (m.type === 'characterData') queue.add(m.target); else m.addedNodes.forEach(n => queue.add(n)); });
        if (!scheduled) { scheduled = true; requestAnimationFrame(() => { scheduled = false; const q = queue; queue = new Set(); q.forEach(process); }); }
    }).observe(document.body, { childList: true, subtree: true, characterData: true });

    function start() {
        process(document.body);
        const go = () => {
            calibrate();
            set({
                numDown: OVERRIDE.numDown != null ? OVERRIDE.numDown : api.numDown,
                punctUp: OVERRIDE.punctUp != null ? OVERRIDE.punctUp : api.punctUp
            });
        };
        if (document.fonts && document.fonts.load) document.fonts.load('200px "' + FONT + '"', SAMPLE).then(go, go); else go();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();