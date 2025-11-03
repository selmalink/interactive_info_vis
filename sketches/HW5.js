// sketches/HW5.js — Bold centered title, tighter spacing, quadrant labels, improved hover
(function () {
    window.registerSketch('hw5', function (p) {
        // ---- Layout ----
        let W = 1080, H = 900;
        const m = { top: 110, right: 28, bottom: 72, left: 72 }; // more top room for title/subtitle
        const legendW = 280;
        const plot = { x0: 0, y0: 0, w: 0, h: 0 };

        // ---- Data ----
        let rows = [];
        let loadErr = null;
        let minVal = 0, maxVal = 16, midVal = 8;
        const dotMin = 6, dotMax = 22;

        // ---- Interaction ----
        let activeShelves = new Set([1, 2, 3]);
        let focusHS_LF = false;
        const UI = { buttons: [] };

        // Colors by shelf (1 low, 3 high)
        const shelfColors = {
            1: p => p.color(33, 113, 181),
            2: p => p.color(51, 160, 44),
            3: p => p.color(251, 154, 153)
        };

        // -------------------- Setup --------------------
        p.setup = () => {
            p.createCanvas(W, H);
            p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
            p.textFont('ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial');
            layout();

            p.loadJSON('cereal.json', (d) => {
                const arr = Array.isArray(d) ? d : Object.values(d || {});
                rows = arr.map(r => ({
                    name: r.name,
                    sugar: Number(r.sugars),
                    fiber: Number(r.fiber),
                    calories: Number(r.calories),
                    shelf: Number(r.shelf)
                })).filter(v =>
                    Number.isFinite(v.sugar) &&
                    Number.isFinite(v.fiber) &&
                    Number.isFinite(v.calories) &&
                    Number.isFinite(v.shelf)
                );

                if (rows.length) {
                    const maxSugar = Math.max(...rows.map(d => d.sugar));
                    const maxFiber = Math.max(...rows.map(d => d.fiber));
                    maxVal = niceCeil(Math.max(maxSugar, maxFiber));
                    minVal = 0;
                    midVal = (minVal + maxVal) / 2;
                }
                computeScreenPositions();
                p.redraw();
            }, (err) => { loadErr = err || true; p.redraw(); });

            p.noLoop();
        };

        p.windowResized = () => {
            layout();
            computeScreenPositions();
            p.redraw();
        };

        // -------------------- Draw --------------------
        p.draw = () => {
            p.background(255);

            drawCenteredTitle();     // bigger, bold, centered
            drawAxes();
            drawQuadrantHighlights();
            drawMidlines();
            drawQuadrantLabels();    // new labels

            if (loadErr) { statusText('Could not load cereal.json. Check the filename/path.', '#991b1b'); return; }
            if (!rows.length) { statusText('Loading cereals…', '#6b7280'); return; }

            drawDots();
            drawLegendAndControls();
            drawTooltip();           // improved hit test + hand cursor
        };

        p.mousePressed = () => {
            for (const b of UI.buttons) {
                if (hitRect(p.mouseX, p.mouseY, b)) {
                    b.onClick();
                    p.redraw();
                    return;
                }
            }
        };

        p.mouseMoved = () => {
            // Forces continuous redraw for tooltip updates
            p.redraw();
        };

        p.touchMoved = () => {
            // Enables hover on touch devices
            p.redraw();
            return false;
        };

        p.mouseOut = () => {
            // Reset cursor when leaving canvas
            p.cursor(p.ARROW);
        };

        // -------------------- Layout helpers --------------------
        function layout() {
            const vw = Math.min(window.innerWidth || W, 1280);
            const vh = Math.min(window.innerHeight || H, 1080);
            W = vw - 8; H = vh - 8;
            p.resizeCanvas(W, H);

            const availW = W - m.left - m.right - legendW;
            const availH = H - m.top - m.bottom;
            const side = Math.max(360, Math.min(availW, availH));
            plot.w = plot.h = side;
            plot.x0 = m.left + Math.max(0, (availW - side) / 2);
            plot.y0 = m.top + Math.max(0, (availH - side) / 2);
        }

        function xScale(v) { return p.map(v, minVal, maxVal, plot.x0, plot.x0 + plot.w); }
        function yScale(v) { return p.map(v, minVal, maxVal, plot.y0 + plot.h, plot.y0); }
        function rScale(cals) {
            if (!rows.length) return 10;
            const cMin = Math.min(...rows.map(d => d.calories));
            const cMax = Math.max(...rows.map(d => d.calories));
            return p.map(cals, cMin, cMax, dotMin, dotMax, true);
        }

        function computeScreenPositions() {
            if (!rows.length) return;
            const pad = 1.5;
            rows.forEach(d => {
                const j = jitter(d.name);
                let x = xScale(d.sugar) + j.x;
                let y = yScale(d.fiber) + j.y;
                x = p.constrain(x, plot.x0 + pad, plot.x0 + plot.w - pad);
                y = p.constrain(y, plot.y0 + pad, plot.y0 + plot.h - pad);
                d._x = x; d._y = y; d._r = rScale(d.calories);
            });
        }

        // -------------------- Viz layers --------------------
        function drawCenteredTitle() {
            const title = 'Eye-Level Advantage?';
            const subtitle = 'Cereal Shelf Height vs Sugar & Fiber';
            const info = 'Each dot is a cereal — size shows calories; color shows shelf height (1=low, 3=high). Hover for details. Use the buttons to highlight eye-level shelves or the high-sugar/low-fiber cluster.';

            // Title (bold + larger)
            p.textAlign(p.CENTER, p.TOP);
            p.textStyle(p.BOLD);
            p.textSize(30);
            p.fill('#0f172a');
            p.text(title, W / 2, 14);

            // Subtitle
            p.textStyle(p.NORMAL);
            p.textSize(20);
            p.fill('#334155');
            p.text(subtitle, W / 2, 50);

            // Info (wrapped & centered)
            p.textSize(14);
            p.fill('#55677f');
            textWrapCentered(info, W / 2, 78, W - legendW - 90, 18);
        }

        function drawAxes() {
            p.stroke('#0f172a'); p.strokeWeight(1.6); p.noFill();
            p.line(plot.x0, plot.y0 + plot.h, plot.x0 + plot.w, plot.y0 + plot.h);
            p.line(plot.x0, plot.y0, plot.x0, plot.y0 + plot.h);

            p.textSize(12); p.fill('#334155'); p.noStroke();
            p.textAlign(p.CENTER, p.TOP);
            [minVal, midVal, maxVal].forEach(v => {
                const px = xScale(v);
                p.stroke('#cbd5e1'); p.line(px, plot.y0 + plot.h, px, plot.y0 + plot.h + 6);
                p.noStroke(); p.text(niceNum(v), px, plot.y0 + plot.h + 10);
            });
            p.textAlign(p.RIGHT, p.CENTER);
            [minVal, midVal, maxVal].forEach(v => {
                const py = yScale(v);
                p.stroke('#cbd5e1'); p.line(plot.x0 - 6, py, plot.x0, py);
                p.noStroke(); p.text(niceNum(v), plot.x0 - 10, py);
            });

            p.fill('#0f172a'); p.noStroke(); p.textSize(14);
            p.textAlign(p.CENTER, p.TOP);
            p.text('Sugar (g per serving)', plot.x0 + plot.w / 2, plot.y0 + plot.h + 40);
            p.push(); p.translate(plot.x0 - 50, plot.y0 + plot.h / 2); p.rotate(-p.HALF_PI);
            p.text('Fiber (g per serving)', 0, 0); p.pop();
        }

        function drawMidlines() {
            const vx = xScale(midVal), hy = yScale(midVal);
            p.stroke('#cfd8e3'); p.strokeWeight(1);
            p.drawingContext.setLineDash([5, 6]);
            p.line(vx, plot.y0, vx, plot.y0 + plot.h);
            p.line(plot.x0, hy, plot.x0 + plot.w, hy);
            p.drawingContext.setLineDash([]);
        }

        function drawQuadrantHighlights() {
            const vx = xScale(midVal), hy = yScale(midVal);
            p.noStroke();
            // Low sugar • High fiber (top-left)
            p.fill(34, 197, 94, 26);
            p.rect(plot.x0, plot.y0, vx - plot.x0, hy - plot.y0);
            // High sugar • Low fiber (bottom-right)
            p.fill(239, 68, 68, 26);
            p.rect(vx, hy, plot.x0 + plot.w - vx, plot.y0 + plot.h - hy);
        }

        function drawQuadrantLabels() {
            const vx = xScale(midVal), hy = yScale(midVal);
            p.textSize(12); p.fill('#374151'); p.noStroke(); p.textAlign(p.CENTER, p.CENTER);
            p.text('Low sugar • High fiber', (plot.x0 + vx) / 2, (plot.y0 + hy) / 2);
            p.text('High sugar • High fiber', (vx + plot.x0 + plot.w) / 2, (plot.y0 + hy) / 2);
            p.text('Low sugar • Low fiber', (plot.x0 + vx) / 2, (hy + plot.y0 + plot.h) / 2);
            p.text('High sugar • Low fiber', (vx + plot.x0 + plot.w) / 2, (hy + plot.y0 + plot.h) / 2);
        }

        function drawDots() {
            p.noStroke();
            rows.forEach(d => {
                const inShelf = activeShelves.has(d.shelf);
                const inQuad = focusHS_LF ? (d.sugar > midVal && d.fiber < midVal) : true;
                const active = inShelf && inQuad;
                const col = (shelfColors[d.shelf] || shelfColors[2])(p);
                const alpha = active ? 230 : 60;
                p.fill(p.red(col), p.green(col), p.blue(col), alpha);
                p.circle(d._x, d._y, d._r);
            });
        }

        function drawLegendAndControls() {
            UI.buttons.length = 0;
            const lx = W - m.right - legendW, ly = m.top, lw = legendW, pad = 14;

            p.stroke('#e5e7eb'); p.fill(255); p.rect(lx, ly, lw, 250, 12);
            p.noStroke(); p.fill('#0f172a'); p.textAlign(p.LEFT, p.TOP);
            p.textSize(16); p.text('Legend & Controls', lx + pad, ly + pad);
            drawDivider(lx + pad, ly + pad + 24, lw - pad * 2);

            const items = [
                { label: 'Shelf 1 (low)', color: shelfColors[1](p) },
                { label: 'Shelf 2', color: shelfColors[2](p) },
                { label: 'Shelf 3 (high)', color: shelfColors[3](p) }
            ];
            let yy = ly + pad + 32;
            items.forEach(it => {
                p.fill(it.color); p.circle(lx + pad + 8, yy + 10, 14);
                p.fill('#374151'); p.textSize(13); p.text(it.label, lx + pad + 28, yy + 2);
                yy += 26;
            });
            p.fill('#111827'); p.textSize(12); p.text('Dot size = calories', lx + pad, yy + 4);

            yy += 28; p.fill('#55677f'); p.textSize(12); p.text('Try these:', lx + pad, yy);

            const b1 = drawButton(lx + pad, yy + 12, lw - pad * 2, 30,
                activeShelves.size === 3 ? 'Highlight eye-level (2 & 3)' : 'Show all shelves',
                () => { activeShelves = (activeShelves.size === 3) ? new Set([2, 3]) : new Set([1, 2, 3]); });
            UI.buttons.push(b1);

            const b2 = drawButton(lx + pad, yy + 52, lw - pad * 2, 30,
                (focusHS_LF ? 'Clear focus' : 'Focus') + ': High sugar • Low fiber',
                () => { focusHS_LF = !focusHS_LF; });
            UI.buttons.push(b2);
        }

        // -------------------- Tooltip (improved) --------------------
        function drawTooltip() {
            const mx = p.mouseX, my = p.mouseY;

            // find nearest within a generous radius
            let hit = null, best = Infinity;
            for (const d of rows) {
                const dx = mx - d._x, dy = my - d._y;
                const dist2 = dx * dx + dy * dy;
                const rHit = Math.max(12, d._r * 0.6); // larger hit area for easier hover
                if (dist2 <= rHit * rHit && dist2 < best) { best = dist2; hit = d; }
            }

            // cursor feedback
            if (hit) p.cursor(p.HAND);
            else p.cursor(p.ARROW);

            if (!hit) return;

            const lines = [
                hit.name || 'Cereal',
                `Sugar: ${hit.sugar} g   Fiber: ${hit.fiber} g`,
                `Calories: ${hit.calories}   Shelf: ${hit.shelf}`
            ];
            p.textSize(13); p.noStroke();
            const pad = 8;
            const w = pad + Math.max(...lines.map(t => p.textWidth(t))) + pad;
            const h = pad + lines.length * 18 + pad;
            let tx = mx + 14, ty = my - h - 10;
            if (tx + w > W - 10) tx = W - 10 - w;
            if (ty < 10) ty = my + 14;
            p.stroke('#d1d5db'); p.fill(255); p.rect(tx, ty, w, h, 8);
            p.fill('#111827');
            lines.forEach((t, i) => p.text(t, tx + pad, ty + pad + (i + 1) * 18 - 6));
        }

        // -------------------- Helpers --------------------
        function drawButton(x, y, w, h, label, onClick) {
            const hovered = hitRect(p.mouseX, p.mouseY, { x, y, w, h });
            p.stroke(hovered ? '#94a3b8' : '#cbd5e1'); p.fill(hovered ? '#f8fafc' : '#ffffff');
            p.rect(x, y, w, h, 8);
            p.noStroke(); p.fill('#0f172a'); p.textAlign(p.CENTER, p.CENTER);
            p.textSize(12); p.text(label, x + w / 2, y + h / 2 + 0.5);
            return { x, y, w, h, onClick };
        }
        function drawDivider(x, y, w) { p.stroke('#e5e7eb'); p.line(x, y, x + w, y); }
        function hitRect(mx, my, r) { return mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h; }

        function statusText(msg, color) {
            p.fill(color); p.noStroke(); p.textSize(14);
            p.textAlign(p.LEFT, p.TOP); p.text(msg, 16, 12);
        }
        function niceCeil(x) {
            const k = [8, 10, 12, 15, 16, 20, 24, 25, 30];
            for (let i = 0; i < k.length; i++) if (x <= k[i]) return k[i];
            const pow = Math.pow(10, Math.floor(Math.log10(x)));
            return Math.ceil(x / pow) * pow;
        }
        function niceNum(v) { const s = (Math.abs(v) >= 10) ? v.toFixed(0) : v.toFixed(1); return s.replace(/\.0$/, ''); }
        function jitter(key) {
            let h = 0; for (let i = 0; i < (key || '').length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
            const jx = ((h % 5) - 2) * 0.4, jy = (((h >> 3) % 5) - 2) * 0.4;
            return { x: jx, y: jy };
        }
        function textWrapCentered(str, cx, y, maxWidth, lineH) {
            const words = String(str).split(/\s+/);
            let line = '', yy = y;
            p.textAlign(p.CENTER, p.TOP);
            for (let i = 0; i < words.length; i++) {
                const test = line ? line + ' ' + words[i] : words[i];
                if (p.textWidth(test) > maxWidth && line) {
                    p.text(line, cx, yy); yy += lineH; line = words[i];
                } else {
                    line = test;
                }
            }
            if (line) p.text(line, cx, yy);
        }
    });
})();

