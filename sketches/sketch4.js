// Instance-mode sketch for tab 4
registerSketch('sk4', function (p) {

  p.setup = function () {
    p.createCanvas(400, 400);
    p.noStroke();
  };

  p.draw = function () {
    p.background(15);

    let hr = p.hour();

    let r = p.map(hr, 0, 23, 80, 160);

    let cool = p.color(80, 120, 255);   // morning / night
    let warm = p.color(255, 100, 30);   // afternoon heat
    let t = p.map(hr, 0, 23, 0, 1);
    let fillCol = p.lerpColor(cool, warm, t);

    p.fill(fillCol);
    p.circle(p.width / 2, p.height / 2, r * 2);

    p.fill(255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(16);
    p.text("Hour: " + hr, p.width / 2, p.height - 20);
  };

  p.windowResized = function() {
  p.resizeCanvas(p.windowWidth, p.windowHeight);
};

});

