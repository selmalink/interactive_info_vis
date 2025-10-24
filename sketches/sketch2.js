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
    let mn = p.minute();
    let sc = p.second();

    p.fill(0);
    p.textSize(16);
    p.text(
      "hour: " + hr24 + "   min: " + mn + "   sec: " + sc,
      p.width / 2,
      p.height / 2
    );
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
});
