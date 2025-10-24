// Instance-mode sketch for tab 3
registerSketch('sk3', function (p) {

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    p.rectMode(p.CENTER);
  };

  p.draw = function () {
    p.background(0);

    let hr24 = p.hour();   // 0-23
    let mn = p.minute(); // 0-59
    let sc = p.second(); // 0-59

    // background
    p.background(0);

    // 1. Convert hour -> "temperature" in °F
    let tempF = tempFromHour(hr24);

    // 2. Convert temperature -> color
    let heatCol = colorFromTemp(tempF);

    // 3. Draw static horizontal heat bands using that color
    let bands = 12;
    for (let i = 0; i < bands; i++) {
      let y = p.map(i, 0, bands - 1, 0, p.height);
      let h = p.height / bands;

      // Slight brightness change per band so you can see layering
      let bandBoost = p.map(i, 0, bands - 1, 0, 40);
      p.fill(
        heatCol.r + bandBoost,
        heatCol.g,
        heatCol.b,
        180
      );

      p.rectMode(p.CORNER);
      p.rect(0, y, p.width, h);
    }

    // 4. Overlay °F panel and digital readout
    drawTempUI(p, tempF, hr24, mn, sc);
  };

  // helper: hour -> fake ambient temp
  function tempFromHour(h) {
    // hottest ~3pm (15), coolest ~3am (3)
    // We'll curve so it peaks midday.
    let peakHour = 15;
    let dist = Math.abs(h - peakHour);
    dist = Math.min(dist, 24 - dist); // wrap around
    // map dist 0..12 -> 105..60
    let t = p.map(dist, 0, 12, 105, 60);
    return t;
  }

  // helper: tempF -> RGB heat color
  function colorFromTemp(tF) {
    // 60°F = cooler purple/blue
    // 105°F = hot orange/red
    let coolR = 80, coolG = 80, coolB = 200;
    let hotR = 255, hotG = 90, hotB = 0;

    let amt = p.map(tF, 60, 105, 0, 1);
    amt = p.constrain(amt, 0, 1);

    let r = p.lerp(coolR, hotR, amt);
    let g = p.lerp(coolG, hotG, amt);
    let b = p.lerp(coolB, hotB, amt);

    return { r, g, b };
  }

  // helper: draw a little oven-style HUD
  function drawTempUI(p, tempF, hr24, mn, sc) {
    let panelW = 180;
    let panelH = 90;
    let x = p.width - panelW - 20;
    let y = 20;

    // dark glass bg
    p.fill(0, 180);
    p.rectMode(p.CORNER);
    p.rect(x, y, panelW, panelH, 8);

    // temp readout
    p.fill(255);
    p.textAlign(p.LEFT, p.TOP);

    p.textSize(28);
    p.text(Math.round(tempF) + "°F", x + 16, y + 12);

    // digital time helper
    let mm = mn.toString().padStart(2, "0");
    let ss = sc.toString().padStart(2, "0");

    p.textSize(16);
    p.text(hr24 + ":" + mm + ":" + ss, x + 16, y + 50);
  }

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
});
