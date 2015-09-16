// Copyright 2014-present Herman Chau.

var screenshot = document.createElement('canvas');
var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');
var cropperCanvas = document.createElement('canvas');
var cropperContext = cropperCanvas.getContext('2d');

var mouse = {
  clicked: false,
  currentX: 0,
  currentY: 0,
  initialX: 0,
  initialY: 0,
};

var searchEngines = [
  {
    search: googleReverseImageSearch,
    name: 'Google'
  },
  {
    search: tineyeReverseImageSearch,
    name: 'TinEye'
  }
];
var currentSearchEngine = 0;

function onKeyDown(eventData) {
  // Keycode 83 = 's'
  if (eventData.which == 83) {
    currentSearchEngine = (currentSearchEngine + 1) % searchEngines.length;
  }
}

function onMouseDown(eventData) {
  if (eventData.which != 1) {
    return;
  }
  mouse.clicked = true;
  mouse.currentX = mouse.initialX = eventData.pageX;
  mouse.currentY = mouse.initialY = eventData.pageY;
}

function onMouseUp(eventData) {
  if (eventData.which != 1) {
    return;
  }
  mouse.clicked = false;

  var left = Math.min(mouse.initialX, mouse.currentX);
  var top = Math.min(mouse.initialY, mouse.currentY);
  var width = Math.abs(mouse.initialX - mouse.currentX);
  var height = Math.abs(mouse.initialY - mouse.currentY);
  console.log(mouse);
  var croppedScreenshot = screenshot.getContext('2d')
    .getImageData(left, top, width, height);

  var temporaryCanvas = document.createElement("canvas"); 
  var temporaryContext = temporaryCanvas.getContext("2d");
  temporaryCanvas.width = width;
  temporaryCanvas.height = height;
  temporaryContext.putImageData(croppedScreenshot, 0, 0);
  temporaryCanvas.toBlob(function (screenshotBlob) {
    chrome.tabs.create(
      {url : '/html/result.html', active : false},
      function (tab) {
        searchEngines[currentSearchEngine].search(
          screenshotBlob, 
          function (url) {
            chrome.tabs.update(tab.id, {url:url});
          });
      });
  }, 'image/png');
}

function onMouseMove(eventData) {
  mouse.currentX = eventData.pageX;
  mouse.currentY = eventData.pageY;
}

function drawCropper() {
  cropperContext.clearRect(
    0, 
    0, 
    cropperCanvas.width, 
    cropperCanvas.height);
  cropperContext.fillStyle = "rgba(0, 0, 0, 0.75)";
  cropperContext.fillRect(
    0, 
    0, 
    cropperCanvas.width, 
    cropperCanvas.height);
  cropperContext.clearRect(
    mouse.initialX, 
    mouse.initialY, 
    mouse.currentX - mouse.initialX, 
    mouse.currentY - mouse.initialY);
  cropperContext.strokeStyle = "rgba(255, 255, 255, 1)";
  cropperContext.setLineDash([10, 15]);
  cropperContext.beginPath();
  cropperContext.moveTo(mouse.currentX, 0);
  cropperContext.lineTo(mouse.currentX, cropperCanvas.height);
  cropperContext.moveTo(mouse.initialX, 0);
  cropperContext.lineTo(mouse.initialX, cropperCanvas.height);
  cropperContext.moveTo(0, mouse.currentY);
  cropperContext.lineTo(cropperCanvas.width, mouse.currentY);
  cropperContext.moveTo(0, mouse.initialY);
  cropperContext.lineTo(cropperCanvas.width, mouse.initialY);
  cropperContext.stroke();
  context.drawImage(cropperCanvas, 0, 0);
}

function drawSearchEngine() {
  context.fillStyle = 'rgba(0,0,0,0.5)';
  context.fillRect(0, 0, canvas.width, 14);
  context.textBaseline = 'top';
  context.textAlign = 'left';
  context.fillStyle = 'white';
  context.fillText(
    'Searching with: ' +
    searchEngines[currentSearchEngine].name +
    ' (press \'s\' to switch)', 
    0, 
    0);
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(screenshot, 0, 0);
  if (mouse.clicked) {
    drawCropper();
  }
  drawSearchEngine();
  window.requestAnimationFrame(draw);
}

function initialize(dataURL) {
  document.body.appendChild(canvas);

  var image;
  image = new Image();
  image.addEventListener("load", function () {
    screenshot.width = canvas.width = cropperCanvas.width = image.width;
    screenshot.height = canvas.height = cropperCanvas.height = image.height;
    screenshot.getContext('2d').drawImage(image, 0, 0);

    // TODO: Figure out a retina fix.
    /*context.scale(
      1/window.devicePixelRatio, 
      1/window.devicePixelRatio);*/

    document.addEventListener("mousemove", onMouseMove, false); 
    document.addEventListener("mousedown", onMouseDown, false); 
    document.addEventListener("mouseup", onMouseUp, false); 
    document.addEventListener("keydown", onKeyDown, false); 
    draw();
  });
  image.src = dataURL;
}

chrome.runtime.sendMessage({request : 'get screenshot'}, initialize);