// Instance-mode sketch for tab 4
registerSketch('sk4', function (p) {

  p.setup = function () {
    p.createCanvas(400, 400);
    p.noStroke();
    p.angleMode(p.DEGREES); // for arcs
    p.textAlign(p.CENTER, p.CENTER);
  };

  p.draw = function () {
    p.background(15);

    let hr = p.hour();
    let mn = p.minute();
    let sc = p.second();

    let r = p.map(hr, 0, 23, 80, 160);

    let cool = p.color(80, 120, 255);   // cooler hour feeling (night/morning)
    let warm = p.color(255, 100, 30);   // hotter hour feeling (afternoon heat)
    let t = p.map(hr, 0, 23, 0, 1);
    let fillCol = p.lerpColor(cool, warm, t);

    p.fill(fillCol);
    p.noStroke();
    p.circle(p.width / 2, p.height / 2, r * 2);

    let sweepDeg = p.map(mn, 0, 59, 0, 360);
    let ringR = r + 20; 
    let glowCol = p.lerpColor(fillCol, p.color(255, 255, 255), 0.4);

    p.stroke(glowCol);
    p.strokeWeight(8);
    p.noFill();
    p.arc(
      p.width / 2,
      p.height / 2,
      ringR * 2,
      ringR * 2,
      -90,
      -90 + sweepDeg
    );

    let isEven = (sc % 2 === 0);

    let pulseBright = p.color(255, 180, 120); // "on"
    let pulseDim    = p.color(80, 40, 20);    // "off"

    let pulseColor = isEven ? pulseBright : pulseDim;
    let pulseSize  = isEven ? 30 : 20;

    p.noStroke();
    p.fill(pulseColor);
    p.circle(p.width / 2, p.height / 2, pulseSize);

    p.noStroke();
    p.fill(255);
    p.textSize(16);
    p.text(
      "Hour: " + hr + "   Minute: " + mn + "   Second: " + sc,
      p.width / 2,
      p.height - 20
    );
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
});
