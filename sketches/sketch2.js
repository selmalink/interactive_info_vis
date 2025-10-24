// Instance-mode sketch for tab 2
registerSketch('sk2', function (p) {

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noStroke();
    p.textAlign(p.CENTER);
  };

  p.draw = function () {
    p.background(255);

    let hr24 = p.hour();
    let hr12 = hr24 % 12;
    if (hr12 === 0) { hr12 = 12; }
    let mn = p.minute();
    let sc = p.second();

    let cakeCenterX = p.width / 2;
    let cakeBaseY = p.height * 0.65;
    let cakeWidth = p.width * 0.45;
    let cakeHeightPerLayer = 12;

    let maxLayers = 10;
    let numLayers = p.floor(p.map(mn, 0, 59, 1, maxLayers + 1));

    p.noStroke();
    p.fill(230);
    p.ellipse(
      cakeCenterX,
      cakeBaseY + 20,
      cakeWidth * 1.3,
      30
    );

    p.rectMode(p.CENTER);
    for (let i = 0; i < numLayers; i++) {
      let layerY = cakeBaseY - i * cakeHeightPerLayer;

      if (i % 2 === 0) {
        p.fill(255);
      } else {
        p.fill(200);
      }

      p.rect(
        cakeCenterX,
        layerY,
        cakeWidth,
        cakeHeightPerLayer + 2,
        4
      );
    }

    let topY = cakeBaseY - (numLayers - 1) * cakeHeightPerLayer - cakeHeightPerLayer / 2;
    let domeHeight = cakeHeightPerLayer * 2.5;
    p.fill(255, 245, 230);
    p.ellipse(
      cakeCenterX,
      topY,
      cakeWidth,
      domeHeight
    );

    p.push();
    p.translate(cakeCenterX, topY);

    for (let i = 0; i < sc; i++) {
      p.randomSeed(i * 999 + sc);

      let sx = p.random(-cakeWidth / 2 + 10, cakeWidth / 2 - 10);
      let sy = p.random(-domeHeight / 4, domeHeight / 4);

      p.fill(
        p.random(100, 255),
        p.random(80, 200),
        p.random(80, 200)
      );
      p.rect(sx, sy, 4, 2, 1);
    }

    p.pop();

    let candleSpacing = cakeWidth / (hr12 + 1);

    for (let c = 1; c <= hr12; c++) {
      let cx = cakeCenterX - cakeWidth / 2 + c * candleSpacing;
      let cy = topY - domeHeight / 2;


      p.fill(255, 255, 200);
      p.rect(cx, cy, 6, 20, 2);

      let flicker = p.sin(p.millis() / 200 + c) * 2;
      p.fill(255, 200, 0);
      p.ellipse(cx, cy - 15 + flicker, 8, 10);
    }

    p.fill(0);
    p.textAlign(p.CENTER);
    p.textSize(14);
    p.text(
      "Hour = candles (" + hr12 + ")\n" +
      "Minute = layers (" + mn + ")\n" +
      "Second = sprinkles (" + sc + ")",
      p.width / 2,
      40
    );
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
});


