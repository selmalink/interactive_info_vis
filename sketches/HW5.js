// sketches/HW5.js — Proportional 2×2 grid + halfway
(function () {
  window.registerSketch('hw5', function (p) {
    let W = 1080, H = 900;
    const m = { top: 28, right: 28, bottom: 64, left: 72 };
    const plot = { x0: 0, y0: 0, w: 0, h: 0 }; 

    let rows = [];
    let minVal = 0, maxVal = 16;
    let midVal = 8; 

    p.preload = () => {
      const data = p.loadJSON('cereal.json'); 
      rows = Array.isArray(data) ? data : [];
    };

    p.setup = () => {
      p.createCanvas(W, H);
      p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
      p.textFont('ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial');

      const cleaned = rows.map(r => ({
        sugar: Number(r.sugars),
        fiber: Number(r.fiber)
      })).filter(d => Number.isFinite(d.sugar) && Number.isFinite(d.fiber) && d.sugar >= 0 && d.fiber >= 0);

      if (cleaned.length) {
        const maxSugar = Math.max(...cleaned.map(d => d.sugar));
        const maxFiber = Math.max(...cleaned.map(d => d.fiber));
        const rangeMax = Math.max(maxSugar, maxFiber);
        maxVal = niceCeil(rangeMax);
        minVal = 0;
        midVal = (minVal + maxVal) / 2;
      }

      layout();
      p.noLoop();
    };

    p.windowResized = () => {
      layout();
      p.redraw();
    };

    p.draw = () => {
      p.background(255);
      drawGrid();
      drawAxes();
      drawGuides();
      drawLabels();
      drawQuadrantTags();
    };

    function layout() {
      const vw = Math.min(window.innerWidth, 1080);
      const vh = Math.min(window.innerHeight, 1080);
      W = vw - 8;
      H = vh - 8;
      p.resizeCanvas(W, H);

      const availW = W - m.left - m.right;
      const availH = H - m.top - m.bottom;
      const side = Math.max(240, Math.min(availW, availH));
      plot.w = plot.h = side;
      plot.x0 = m.left + (availW - side) / 2;
      plot.y0 = m.top + (availH - side) / 2;
    }

    function xScale(v) { return p.map(v, minVal, maxVal, plot.x0, plot.x0 + plot.w); }
    function yScale(v) { return p.map(v, minVal, maxVal, plot.y0 + plot.h, plot.y0); }

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
      const vx = xScale(midVal);
      const hy = yScale(midVal);

      p.stroke('#111827');
      p.strokeWeight(1.5);
      p.drawingContext.setLineDash([6, 6]);
      p.line(vx, plot.y0, vx, plot.y0 + plot.h);
      p.line(plot.x0, hy, plot.x0 + plot.w, hy);
      p.drawingContext.setLineDash([]);
    }

    function drawLabels() {
      p.fill('#111827'); p.noStroke(); p.textSize(14);
      p.textAlign(p.CENTER, p.TOP);
      p.text('Sugar (g per serving)', plot.x0 + plot.w / 2, plot.y0 + plot.h + 38);
      p.push(); p.translate(plot.x0 - 46, plot.y0 + plot.h / 2); p.rotate(-p.HALF_PI);
      p.text('Fiber (g per serving)', 0, 0); p.pop();

      p.textAlign(p.LEFT, p.TOP); p.textSize(18);
      p.text('Cereal Health Spectrum — Proportional 2×2 Grid', plot.x0, 6);
    }

    function drawQuadrantTags() {
      const vx = xScale(midVal);
      const hy = yScale(midVal);
      p.textSize(12); p.fill('#374151'); p.noStroke(); p.textAlign(p.CENTER, p.CENTER);
      p.text('Low sugar • High fiber', (plot.x0 + vx) / 2, (plot.y0 + hy) / 2);
      p.text('High sugar • High fiber', (vx + plot.x0 + plot.w) / 2, (plot.y0 + hy) / 2);
      p.text('Low sugar • Low fiber', (plot.x0 + vx) / 2, (hy + plot.y0 + plot.h) / 2);
      p.text('High sugar • Low fiber', (vx + plot.x0 + plot.w) / 2, (hy + plot.y0 + plot.h) / 2);
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
  });
})();

