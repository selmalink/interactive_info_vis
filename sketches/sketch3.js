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
    let mn   = p.minute(); // 0-59
    let sc   = p.second(); // 0-59

    p.fill(255);
    p.textSize(16);
    p.text(
      "Heatwave Clock base\nhour: " + hr24 + "  min: " + mn + "  sec: " + sc,
      p.width / 2,
      p.height / 2
    );
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
});
