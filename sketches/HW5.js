// sketches/HW5.js — Iteration 2 with robust data loading (shows dots)
(function () {
  window.registerSketch('hw5', function (p) {
    let W = 1080, H = 900;
    const m = { top: 28, right: 28, bottom: 72, left: 72 };
    const legendW = 220;
    const plot = { x0: 0, y0: 0, w: 0, h: 0 };

    let rows = [];
    let loadErr = null;
    let minVal = 0, maxVal = 16, midVal = 8;
    const dotMin = 7, dotMax = 26;

    const shelfColors = {
      1: p => p.color(33, 113, 181),
      2: p => p.color(51, 160, 44),
      3: p => p.color(251, 154, 153)
    };

    p.setup = () => {
      p.createCanvas(W, H);
      p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
      p.textFont('ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial');

      layout();

      p.loadJSON(
        'cereal.json',
        (d) => {
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
            midVal  = (minVal + maxVal) / 2;
          }
          computeScreenPositions();
          p.redraw();
        },
        (err) => { loadErr = err || true; p.redraw(); }
      );

      p.noLoop(); 
    };

    p.windowResized = () => {
      layout();
      computeScreenPositions();
      p.redraw();
    };

    p.draw = () => {
      p.background(255);
      drawGrid();
      drawAxes();
      drawGuides();

      if (loadErr) {
        p.fill('#991b1b'); p.noStroke(); p.textSize(14);
        p.textAlign(p.LEFT, p.TOP);
        p.text('Could not load cereal.json. Check the filename/path.', 16, 12);
        return;
      }
      if (!rows.length) {
        p.fill('#6b7280'); p.noStroke(); p.textSize(14);
        p.textAlign(p.LEFT, p.TOP);
        p.text('Loading cereals…', 16, 12);
        return;
      }

      drawDots();
      drawLegend();
      drawLabels();
      drawQuadrantTags();
      drawTooltip();
    };

    function layout() {
      const vw = Math.min(window.innerWidth, 1080);
      const vh = Math.min(window.innerHeight, 1080);
      W = vw - 8; H = vh - 8;
      p.resizeCanvas(W, H);

      const availW = W - m.left - m.right - legendW;
      const availH = H - m.top - m.bottom;
      const side = Math.max(260, Math.min(availW, availH));
      plot.w = plot.h = side;
      plot.x0 = m.left + (availW - side) / 2;
      plot.y0 = m.top + (availH - side) / 2;
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
      rows.forEach(d => {
        const j = jitter(d.name);
        d._x = xScale(d.sugar) + j.x;
        d._y = yScale(d.fiber) + j.y;
        d._r = rScale(d.calories);
      });
    }

    function drawAxes() {
      p.stroke('#111827'); p.strokeWeight(1.5); p.noFill();
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
    }

    function drawGrid() {
      p.stroke('#e5e7eb'); p.strokeWeight(1);
      p.line(xScale(midVal), plot.y0, xScale(midVal), plot.y0 + plot.h);
      p.line(plot.x0, yScale(midVal), plot.x0 + plot.w, yScale(midVal));
    }

    function drawGuides() {
      const vx = xScale(midVal), hy = yScale(midVal);
      p.stroke('#111827'); p.strokeWeight(1.5);
      p.drawingContext.setLineDash([6, 6]);
      p.line(vx, plot.y0, vx, plot.y0 + plot.h);
      p.line(plot.x0, hy, plot.x0 + plot.w, hy);
      p.drawingContext.setLineDash([]);
    }

    function drawDots() {
      p.noStroke();
      rows.forEach(d => {
        const col = (shelfColors[d.shelf] || shelfColors[2])(p);
        p.fill(col);
        p.circle(d._x, d._y, d._r);
      });
    }

    function drawLegend() {
      const lx = W - m.right - legendW, ly = m.top, lw = legendW, pad = 14;
      p.stroke('#e5e7eb'); p.fill(255); p.rect(lx, ly, lw, 190, 12);
      p.noStroke(); p.fill('#111827'); p.textAlign(p.LEFT, p.TOP);
      p.textSize(18); p.text('Legend', lx + pad, ly + pad);
      const items = [
        { label: 'Shelf 1 (lowest)',  color: shelfColors[1](p) },
        { label: 'Shelf 2',           color: shelfColors[2](p) },
        { label: 'Shelf 3 (highest)', color: shelfColors[3](p) }
      ];
      let yy = ly + pad + 28;
      items.forEach(it => {
        p.fill(it.color); p.circle(lx + pad + 8, yy + 10, 14);
        p.fill('#374151'); p.textSize(13); p.text(it.label, lx + pad + 28, yy);
        yy += 26;
      });
      yy += 6; p.fill('#111827'); p.textSize(13); p.text('Dot size = calories', lx + pad, yy);
      yy += 20; p.noFill(); p.stroke('#9ca3af');
      p.circle(lx + pad + 12, yy, 10);
      p.circle(lx + pad + 52, yy, 18);
      p.circle(lx + pad + 100, yy, 26);
    }

    function drawLabels() {
      p.fill('#111827'); p.noStroke(); p.textSize(14);
      p.textAlign(p.CENTER, p.TOP);
      p.text('Sugar (g per serving)', plot.x0 + plot.w / 2, plot.y0 + plot.h + 42);
      p.push(); p.translate(plot.x0 - 50, plot.y0 + plot.h / 2); p.rotate(-p.HALF_PI);
      p.text('Fiber (g per serving)', 0, 0); p.pop();
      p.textAlign(p.LEFT, p.TOP); p.textSize(18);
      p.text('Cereal Health Spectrum — Sugar vs Fiber by Shelf', plot.x0, 6);
      p.textSize(12); p.fill('#6b7280');
      p.text('Each dot is a cereal — size: calories, color: shelf placement', plot.x0, 26);
    }

    function drawQuadrantTags() {
      const vx = xScale(midVal), hy = yScale(midVal);
      p.textSize(12); p.fill('#374151'); p.noStroke(); p.textAlign(p.CENTER, p.CENTER);
      p.text('Low sugar • High fiber', (plot.x0 + vx) / 2, (plot.y0 + hy) / 2);
      p.text('High sugar • High fiber', (vx + plot.x0 + plot.w) / 2, (plot.y0 + hy) / 2);
      p.text('Low sugar • Low fiber', (plot.x0 + vx) / 2, (hy + plot.y0 + plot.h) / 2);
      p.text('High sugar • Low fiber', (vx + plot.x0 + plot.w) / 2, (hy + plot.y0 + plot.h) / 2);
    }

    function drawTooltip() {
      const mx = p.mouseX, my = p.mouseY;
      let hit = null, best = Infinity;
      for (const d of rows) {
        const dist = p.dist(mx, my, d._x, d._y);
        if (dist <= Math.max(10, d._r / 2) && dist < best) { best = dist; hit = d; }
      }
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

    function niceCeil(x) {
      const k = [8, 10, 12, 15, 16, 20, 24, 25, 30];
      for (let i = 0; i < k.length; i++) if (x <= k[i]) return k[i];
      const pow = Math.pow(10, Math.floor(Math.log10(x)));
      return Math.ceil(x / pow) * pow;
    }
    function niceNum(v) {
      const s = (Math.abs(v) >= 10) ? v.toFixed(0) : v.toFixed(1);
      return s.replace(/\.0$/, '');
    }
    function jitter(key) {
      let h = 0;
      for (let i = 0; i < (key || '').length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
      const jx = ((h % 7) - 3) * 0.6;
      const jy = (((h >> 3) % 7) - 3) * 0.6;
      return { x: jx, y: jy };
    }
  });
})();


