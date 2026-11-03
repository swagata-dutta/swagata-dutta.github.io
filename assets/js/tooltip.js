// Tooltips for icon controls: any element with [data-tooltip] gets a small popup on hover or keyboard focus.
// The text is data-tooltip, or the element's aria-label when that is left empty (so labels that change, like the
// theme toggle's, stay in sync). data-tooltip-kbd="Ctrl+K" adds a shortcut hint; Ctrl reads as ⌘ on Apple devices.
// Behaves like a native tooltip: short delay before the first one, instant while moving between controls,
// hidden on click, scroll, Escape and touch, and kept inside the viewport.
(function () {
    const SHOW_DELAY = 450;
    const WARM_PERIOD = 400; // after a tooltip hides, the next one shows without delay for this long
    const GAP = 8;
    const EDGE = 8;
    const isApple = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

    const tip = document.createElement('div');
    tip.className = 'tooltip';
    // The label is already exposed through aria-label; the popup is purely visual
    tip.setAttribute('aria-hidden', 'true');
    document.body.appendChild(tip);

    let target = null;
    let showTimer = 0;
    let lastHidden = 0;
    let suppressed = null; // element clicked while hovered: stays quiet until the pointer leaves it

    function textFor(el) {
        return el.dataset.tooltip || el.getAttribute('aria-label') || '';
    }

    function render(el) {
        tip.textContent = textFor(el);
        const kbd = el.dataset.tooltipKbd;
        if (kbd) {
            const keys = document.createElement('span');
            keys.className = 'tooltip-keys';
            kbd.split('+').forEach(k => {
                const key = document.createElement('kbd');
                key.textContent = isApple && k === 'Ctrl' ? '⌘' : k;
                keys.appendChild(key);
            });
            tip.appendChild(keys);
        }
    }

    function place(el) {
        const r = el.getBoundingClientRect();
        const w = tip.offsetWidth;
        const h = tip.offsetHeight;
        const vw = document.documentElement.clientWidth;
        const below = r.bottom + GAP + h <= window.innerHeight - EDGE || r.top - GAP - h < EDGE;
        const left = Math.min(Math.max(r.left + r.width / 2 - w / 2, EDGE), vw - w - EDGE);
        tip.style.left = left + 'px';
        tip.style.top = (below ? r.bottom + GAP : r.top - GAP - h) + 'px';
        tip.dataset.side = below ? 'bottom' : 'top';
    }

    function show(el) {
        clearTimeout(showTimer);
        if (!textFor(el)) return;
        target = el;
        render(el);
        place(el);
        tip.classList.add('is-visible');
    }

    function hide() {
        clearTimeout(showTimer);
        if (target) lastHidden = performance.now();
        target = null;
        tip.classList.remove('is-visible');
    }

    function schedule(el, delay) {
        clearTimeout(showTimer);
        if (performance.now() - lastHidden < WARM_PERIOD || target) delay = 0;
        if (target && target !== el) hide();
        showTimer = setTimeout(() => show(el), delay);
    }

    document.addEventListener('pointerover', (e) => {
        const el = e.target.closest('[data-tooltip]');
        if (!el || el === target || el === suppressed) return;
        // Touch has no hover; a long press would only flash the popup
        if (e.pointerType === 'touch') return;
        schedule(el, SHOW_DELAY);
    });
    document.addEventListener('pointerout', (e) => {
        const el = e.target.closest('[data-tooltip]');
        if (!el || el.contains(e.relatedTarget)) return;
        if (el === suppressed) suppressed = null;
        if (el === target || !target) hide();
    });
    document.addEventListener('pointerdown', (e) => {
        const el = e.target.closest('[data-tooltip]');
        suppressed = el && e.pointerType !== 'touch' ? el : null;
        hide();
    });

    // Keyboard users get the tooltip on focus (not on focus after a mouse click)
    document.addEventListener('focusin', (e) => {
        const el = e.target.closest('[data-tooltip]');
        if (el && el !== suppressed && el.matches(':focus-visible')) schedule(el, 0);
    });
    document.addEventListener('focusout', (e) => {
        if (e.target.closest('[data-tooltip]') === target) hide();
    });

    document.addEventListener('keydown', (e) => {
        if (!target) return;
        // Escape dismisses the tooltip; Enter/Space activate the control, which changes its label
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ' || e.ctrlKey || e.metaKey) hide();
    });
    window.addEventListener('scroll', hide, { passive: true });
    window.addEventListener('resize', hide);
    window.addEventListener('blur', hide);
})();
