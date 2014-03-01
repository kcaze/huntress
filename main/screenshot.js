chrome.runtime.sendMessage({request : "get image"}, function (imgSrc){
  var scrapCanvas = document.createElement("canvas"); 
  var scrapCtx = scrapCanvas.getContext("2d");
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  var img = new Image();

  img.onload = function() {
    // draw the screenshot
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.fillStyle = "rgba(0,0,255,0.3)";

    document.body.appendChild(canvas);

    // set up the events for cropping (using easelJS)
    var stage = new createjs.Stage(canvas);
    var image = new createjs.Bitmap(imgSrc);
    var rect = new createjs.Shape();
    var clicked = 0;

    rect.graphics.beginFill("rgba(0,120,255,0.4)").drawRect(0,0,1,1);
    rect.scaleX = rect.scaleY = 1; 

    stage.addChild(image);
    stage.addEventListener("stagemousedown", function (event) {
      clicked = 1;
      rect.x = event.stageX;
      rect.y = event.stageY;
      stage.addChild(rect);
    });
    stage.addEventListener("stagemouseup", function (event) {
      clicked = 0;
      stage.removeChild(rect);
      stage.update();

      var x = rect.scaleX > 0 ? rect.x : rect.x + rect.scaleX;
      var y = rect.scaleY > 0 ? rect.y : rect.y + rect.scaleY;
      var img = ctx.getImageData(x, y, Math.abs(rect.scaleX), Math.abs(rect.scaleY));

      scrapCanvas.width = img.width;
      scrapCanvas.height = img.height;
      scrapCtx.putImageData(img, 0, 0);
      scrapCanvas.toBlob(function (imageBlob) {
        googleReverseImageSearch(imageBlob, function(URL) {
          chrome.tabs.create({url : URL, active : false});
        });
      });

      rect.scaleX = rect.scaleY = 1;
    });
    createjs.Ticker.addEventListener("tick", function (event) {
      stage.update();
      if (clicked) {
        rect.scaleX = stage.mouseX - rect.x;
        rect.scaleY = stage.mouseY - rect.y;
      }
    });
  };
  img.src = imgSrc;
});
