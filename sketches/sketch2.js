// Instance-mode sketch for tab 2
registerSketch('sk2', function (p) {

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noStroke();
    p.textAlign(p.CENTER);
  };

  p.draw = function () {
    p.background(255);

    let mn = p.minute();

    let cakeCenterX = p.width / 2;
    let cakeBaseY   = p.height * 0.65;
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

    p.fill(255);
    p.rect(
      cakeCenterX,
      topY,
      cakeWidth,
      cakeHeightPerLayer + 4,
      6 
    );

    p.fill(0);
    p.textAlign(p.CENTER);
    p.textSize(14);
    p.text(
      "Minute → number of cake layers\nCurrent minute: " + mn,
      p.width / 2,
      40
    );
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
});


