// Instance-mode sketch for tab 3
registerSketch('sk3', function (p) {

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    p.rectMode(p.CENTER);
  };

  p.draw = function () {
    let hr24 = p.hour();    
    let mn = p.minute();  
    let sc = p.second(); 
    let ms = p.millis();  

    p.background(0);

    let tempF = tempFromHour(hr24);
    let heatCol = colorFromTemp(tempF);

    let amp = p.map(mn, 0, 59, 2, 25);

    let globalPhase = sc + ms * 0.002;

    let bands = 12;

    for (let i = 0; i < bands; i++) {

      let y = p.map(i, 0, bands - 1, 0, p.height);
      let h = p.height / bands;

      let bandBoost = p.map(i, 0, bands - 1, 0, 40);
      p.fill(
        heatCol.r + bandBoost,
        heatCol.g,
        heatCol.b,
        180
      );

      p.beginShape();

      for (let x = 0; x <= p.width; x += 10) {
        let waveOffset = p.sin((x * 0.02) + globalPhase * 0.5 + i) * amp;
        p.vertex(x, y + waveOffset);
      }

      for (let x = p.width; x >= 0; x -= 10) {
        let waveOffset2 = p.sin((x * 0.02) + globalPhase * 0.5 + i + 10) * amp;
        p.vertex(x, y + h + waveOffset2);
      }

      p.endShape(p.CLOSE);
    }

    drawTempUI(p, tempF, hr24, mn, sc);
  };

  function tempFromHour(h) {
    let peakHour = 15;
    let dist = Math.abs(h - peakHour);
    dist = Math.min(dist, 24 - dist);
    return p.map(dist, 0, 12, 105, 60);
  }

  function colorFromTemp(tF) {
    let coolR = 80, coolG = 80, coolB = 200;
    let hotR = 255, hotG = 90, hotB = 0;
    let amt = p.map(tF, 60, 105, 0, 1);
    amt = p.constrain(amt, 0, 1);
    let r = p.lerp(coolR, hotR, amt);
    let g = p.lerp(coolG, hotG, amt);
    let b = p.lerp(coolB, hotB, amt);
    return { r, g, b };
  }

  function drawTempUI(p, tempF, hr24, mn, sc) {
    let panelW = 180;
    let panelH = 90;
    let x = p.width - panelW - 20;
    let y = 20;

    p.fill(0, 180);
    p.rectMode(p.CORNER);
    p.rect(x, y, panelW, panelH, 8);

    p.fill(255);
    p.textAlign(p.LEFT, p.TOP);

    p.textSize(28);
    p.text(Math.round(tempF) + "°F", x + 16, y + 12);

    let mm = mn.toString().padStart(2, "0");
    let ss = sc.toString().padStart(2, "0");

    p.textSize(16);
    p.text(hr24 + ":" + mm + ":" + ss, x + 16, y + 50);
  }

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
});
