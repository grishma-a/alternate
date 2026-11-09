/* fontfix.js: one file that fixes digit and punctuation height in your handwriting font.
 * Add to EVERY page, as the last thing before </body>:   <script src="fontfix.js"></script>
 * Nothing else is needed (it injects its own CSS). Delete any older digit/punctuation scripts or CSS. */
(function () {
    /* ===== settings ===== */
    const FONT = 'Numbers-Regular';                 // font-family name used in your @font-face
    const OVERRIDE = {
        numDown: 0.8,       // em to push digits DOWN (positive value = down)
        punctUp: 0.3
    };    // em to lift . , ; : ! ? UP (null = measure automatically)
    /* ==================== */

    const SKIP = /^(SCRIPT|STYLE|TEXTAREA|INPUT|OPTION|CANVAS|NOSCRIPT)$/;
    const api = window.fontFix = { numDown: 0.5, punctUp: 0, set, refresh: () => process(document.body) };

    const st = document.createElement('style');
    st.textContent = '.ff-n{position:relative;top:var(--ff-num,0)}.ff-one{position:relative;top:calc(var(--ff-num, 0) + 0.1em);font-size:0.05em;display:inline-block;}.ff-two{position:relative;top:calc(var(--ff-num, 0) - 0.3em);font-size:0.85em;display:inline-block;}.ff-p{position:relative;top:var(--ff-punct,0)}';
    document.head.appendChild(st);

    function set(o) {                       // also usable from the browser console: fontFix.set({numDown:.5})
        if (o.numDown != null) api.numDown = o.numDown;
        if (o.punctUp != null) api.punctUp = o.punctUp;
        const r = document.documentElement.style;
        r.setProperty('--ff-num', api.numDown + 'em');      // positive top = down
        r.setProperty('--ff-punct', (-api.punctUp) + 'em');  // negative top = up
    }

    /* measure where this font really puts the characters, relative to the baseline */
    function calibrate() {
        try {
            const SZ = 200, c = document.createElement('canvas').getContext('2d');
            if (!c || !document.fonts || !document.fonts.check(SZ + 'px "' + FONT + '"')) return;
            c.font = SZ + 'px "' + FONT + '"'; c.textBaseline = 'alphabetic';
            const bottom = ch => c.measureText(ch).actualBoundingBoxDescent;    // +: below baseline, -: floating above
            const med = a => a.sort((x, y) => x - y)[a.length >> 1];
            const clamp = v => Math.max(-1.2, Math.min(1.2, v));
            const dDigit = med(['0', '1', '2', '6', '8'].map(bottom));
            const dPunct = med(['.', ':'].map(bottom));
            if (isFinite(dDigit) && isFinite(dPunct))
                set({ numDown: clamp(-dDigit / SZ), punctUp: clamp(dPunct / SZ) });
        } catch (e) { }
    }

    /* wrap each digit, punctuation mark, and the number 2 in spans the CSS can nudge/scale */
    const mk = (cls, t) => { const s = document.createElement('span'); s.className = cls; s.textContent = t; return s; };
    function process(root) {
        try {
            if (root && root.nodeType === 3) root = root.parentNode;
            if (!root || root.nodeType !== 1) return;
            const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), list = [];
            while (w.nextNode()) {
                const n = w.currentNode, p = n.parentNode;
                if (!p || SKIP.test(p.nodeName) || p.classList.contains('ff-n') || p.classList.contains('ff-two') || p.classList.contains('ff-p') ||
                    (p.closest && p.closest('[data-nofix]'))) continue;
                if (/[\d.,;:!?]/.test(n.nodeValue)) list.push(n);
            }
            list.forEach(n => {
                const f = document.createDocumentFragment();
                n.nodeValue.split('').forEach(char => {
                    if (/[013-9]/.test(char)) f.append(mk('ff-n', char));
                    else if (char === '2') f.append(mk('ff-two', char));
                    else if (/[.,;:!?]/.test(char)) f.append(mk('ff-p', char));
                    else {
                        const last = f.lastChild;
                        if (last && last.nodeType === 3) last.nodeValue += char;
                        else f.append(document.createTextNode(char));
                    }
                });
                n.replaceWith(f);
            });
        } catch (e) { }
    }

    /* keep fixing text that appears later (coffee list, counters, tooltips, the nav menu...) */
    let queue = new Set(), scheduled = false;
    new MutationObserver(ms => {
        ms.forEach(m => { if (m.type === 'characterData') queue.add(m.target); else m.addedNodes.forEach(n => queue.add(n)); });
        if (!scheduled) { scheduled = true; requestAnimationFrame(() => { scheduled = false; const q = queue; queue = new Set(); q.forEach(process); }); }
    }).observe(document.body, { childList: true, subtree: true, characterData: true });

    function start() {
        set({ numDown: OVERRIDE.numDown || 0, punctUp: OVERRIDE.punctUp || 0 });
        process(document.body);
        const go = () => {
            calibrate(); if (OVERRIDE.numDown != null || OVERRIDE.punctUp != null)
                set({ numDown: OVERRIDE.numDown != null ? OVERRIDE.numDown : api.numDown, punctUp: OVERRIDE.punctUp != null ? OVERRIDE.punctUp : api.punctUp });
        };
        if (document.fonts && document.fonts.load) document.fonts.load('200px "' + FONT + '"').then(go, go); else go();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();