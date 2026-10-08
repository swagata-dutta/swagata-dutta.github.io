// Interactive graph-theory canvas background (shared by index.html and 404.html).
// Drifting vertices connect when close; edges also reach toward the mouse pointer.
(function() {
    const canvas = document.getElementById('graph-network-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = window.devicePixelRatio || 1;
    let nodes = [];
    // Matches the root font-size scaling applied on very large displays (1 up to 1920px wide screens)
    let scale = 1;
    const mouse = { x: null, y: null, maxDist: 160 };

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        dpr = window.devicePixelRatio || 1;
        scale = (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16) / 16;
        mouse.maxDist = 160 * scale;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        initNodes();
    }

    function initNodes() {
        // Adaptive node count based on screen width; larger-than-1080p screens keep the same node density (capped)
        const baseCount = width < 640 ? 24 : (width < 1024 ? 40 : 55);
        const count = Math.max(baseCount, Math.min(150, Math.round(width * height / (37700 * scale * scale))));
        nodes = [];
        for (let i = 0; i < count; i++) {
            nodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.35 * scale,
                vy: (Math.random() - 0.5) * 0.35 * scale,
                radius: (Math.random() * 1.4 + 1.8) * scale,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: 0.015 + Math.random() * 0.02
            });
        }
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 100);
    });

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    function render() {
        ctx.clearRect(0, 0, width, height);

        const isDark = document.documentElement.classList.contains('dark');
        
        // Color configuration: Teal theme-adaptive
        const edgeRgb = isDark ? '45, 212, 191' : '15, 118, 110';
        const nodeFill = isDark ? 'rgba(45, 212, 191, 0.65)' : 'rgba(13, 148, 136, 0.45)';
        const nodeHalo = isDark ? 'rgba(45, 212, 191, 0.18)' : 'rgba(13, 148, 136, 0.12)';
        const mouseEdgeRgb = isDark ? '56, 189, 248' : '14, 165, 233';

        const maxDist = (width < 640 ? 100 : 135) * scale;
        const maxDistSq = maxDist * maxDist;
        const mouseMaxDistSq = mouse.maxDist * mouse.maxDist;
        const edgeStroke = `rgb(${edgeRgb})`;
        const mouseEdgeStroke = `rgb(${mouseEdgeRgb})`;
        const edgeAlpha = isDark ? 0.22 : 0.15;
        const mouseEdgeAlpha = isDark ? 0.35 : 0.25;
        const hasMouse = mouse.x !== null && mouse.y !== null;

        // 1. Update node positions & draw inter-node edges
        // (edge opacity is applied via globalAlpha so the stroke colour string is not rebuilt per edge)
        for (let i = 0; i < nodes.length; i++) {
            const n1 = nodes[i];

            n1.x += n1.vx;
            n1.y += n1.vy;
            n1.pulse += n1.pulseSpeed;

            // Bounce softly within window boundaries
            if (n1.x <= 0) { n1.x = 0; n1.vx *= -1; }
            else if (n1.x >= width) { n1.x = width; n1.vx *= -1; }
            if (n1.y <= 0) { n1.y = 0; n1.vy *= -1; }
            else if (n1.y >= height) { n1.y = height; n1.vy *= -1; }

            // Inter-node connections
            ctx.strokeStyle = edgeStroke;
            ctx.lineWidth = 0.85;
            for (let j = i + 1; j < nodes.length; j++) {
                const n2 = nodes[j];
                const dx = n1.x - n2.x;
                const dy = n1.y - n2.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < maxDistSq) {
                    ctx.globalAlpha = (1 - Math.sqrt(distSq) / maxDist) * edgeAlpha;
                    ctx.beginPath();
                    ctx.moveTo(n1.x, n1.y);
                    ctx.lineTo(n2.x, n2.y);
                    ctx.stroke();
                }
            }

            // Mouse proximity connections (interactive graph exploratory effect)
            if (hasMouse) {
                const mdx = n1.x - mouse.x;
                const mdy = n1.y - mouse.y;
                const mdistSq = mdx * mdx + mdy * mdy;

                if (mdistSq < mouseMaxDistSq) {
                    ctx.globalAlpha = (1 - Math.sqrt(mdistSq) / mouse.maxDist) * mouseEdgeAlpha;
                    ctx.strokeStyle = mouseEdgeStroke;
                    ctx.lineWidth = 1.0;
                    ctx.beginPath();
                    ctx.moveTo(n1.x, n1.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }
        ctx.globalAlpha = 1;

        // 2. Draw graph vertices (nodes)
        for (let i = 0; i < nodes.length; i++) {
            const n = nodes[i];
            const r = n.radius + Math.sin(n.pulse) * 0.45;

            // Subtle vertex halo
            ctx.beginPath();
            ctx.arc(n.x, n.y, r + 2.5 * scale, 0, Math.PI * 2);
            ctx.fillStyle = nodeHalo;
            ctx.fill();

            // Vertex core
            ctx.beginPath();
            ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
            ctx.fillStyle = nodeFill;
            ctx.fill();
        }

        requestAnimationFrame(render);
    }

    resize();
    requestAnimationFrame(render);
})();
