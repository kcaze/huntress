chrome.runtime.sendMessage({request : "get image"}, function (imgSrc){
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  var selectCanvas = document.createElement("canvas"); 
  var selectCtx = selectCanvas.getContext("2d");
  var scrapCanvas = document.createElement("canvas"); 
  var scrapCtx = scrapCanvas.getContext("2d");

  canvas.style.zIndex = "1";
  selectCanvas.style.zIndex = "2";

  document.body.appendChild(canvas);
  document.body.appendChild(selectCanvas);

  var image = new Image();
  image.addEventListener("load", function () {
    //set up canvases and draw the screenshot
    canvas.width = image.width;
    canvas.height = image.height;
    selectCanvas.width = image.width;
    selectCanvas.height = image.height;

    ctx.drawImage(image, 0, 0);
    selectCtx.fillStyle = "rgba(0, 0, 255, 0.3)";

    selectCanvas.addEventListener("mousemove", onMouseMove, false); 
    selectCanvas.addEventListener("mousedown", onMouseDown, false); 
    selectCanvas.addEventListener("mouseup", onMouseUp, false); 
  });
  image.src = imgSrc;

  var downX = downY = 0;
  var x = y = 0;
  var clicked = 0;

  function onMouseMove(e) {
    x = e.pageX;
    y = e.pageY;

    selectCtx.clearRect(0, 0, selectCanvas.width, selectCanvas.height);
    if (clicked) {
      selectCtx.fillRect(downX, downY, x-downX, y-downY);
    }
  }

  function onMouseDown(e) {
    if (e.which == 1) {
      clicked = 1;
      downX = e.pageX;
      downY = e.pageY;
    }
  }

  function onMouseUp(e) {
    if (e.which == 1){
      clicked = 0;
      var left = Math.min(downX, x);
      var top = Math.min(downY, y);
      var width = Math.abs(x - downX);
      var height = Math.abs(y - downY);
      var img = ctx.getImageData(left, top, width, height);
      scrapCanvas.width = width;
      scrapCanvas.height = height;
      scrapCtx.putImageData(img, 0, 0);
      scrapCanvas.toBlob(function (imageBlob) {
        googleReverseImageSearch(imageBlob, function(URL) {
          chrome.tabs.create({url : URL, active : false});
        });
      });
    }
  }
});
