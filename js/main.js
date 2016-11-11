var canvas = initializeCanvas();
var mouse = initializeMouse();

document.body.appendChild(canvas);
chrome.runtime.onMessage.addListener(message => {
  // toggle the display from none to inline or vice versa
  canvas.style.display = canvas.style.display == 'none' ? '' : 'none';
  canvas.width = window.screen.availWidth;
  canvas.height = window.screen.availHeight;
  canvas.drawClear();
});

function initializeCanvas() {
  var canvas = document.createElement('canvas');
  canvas.style.all = 'initial';
  canvas.style.position = 'absolute';
  canvas.style.top = 0;
  canvas.style.left = 0;
  canvas.style.zIndex = 1 << 30;
  //canvas.style.display = 'none';
  canvas.drawClear = drawClear;
  canvas.drawCropper = drawCropper;
  canvas.addEventListener("mousedown", makeEventListener("mousedown"));
  canvas.addEventListener("mousemove", makeEventListener("mousemove"));
  canvas.addEventListener("mouseup", makeEventListener("mouseup"));
  return canvas;

  function drawClear() {
    var context = canvas.getContext('2d');
    context.save();
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'rgba(0, 0, 0, 0.25)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();
  }

  function drawCropper (x1, y1, x2, y2) {
    var context = canvas.getContext('2d');
    context.save();
    context.clearRect(x1, y1, x2 - x1, y2 - y1);
    context.strokeStyle = 'rgba(255, 255, 255, 1)';
    context.setLineDash([10, 15]);
    context.beginPath();
    context.moveTo(x1, 0);
    context.lineTo(x1, canvas.height);
    context.moveTo(x2, 0);
    context.lineTo(x2, canvas.height);
    context.moveTo(0, y1);
    context.lineTo(canvas.width, y1);
    context.moveTo(0, y2);
    context.lineTo(canvas.width, y2);
    context.stroke();
    context.restore();
  }

  function makeEventListener(eventType) {
    return function(eventData) {
      if (eventData.which != 1) return;
      mouse[eventType](eventData.pageX, eventData.pageY);
      canvas.drawClear();
      if (mouse.clicked) {
        canvas.drawCropper(
          mouse.initialX, mouse.initialY,
          mouse.currentX, mouse.currentY
        );
      }
    }
  }

  function getDocumentWidth() {
    return window.screen.availWidth;
  }

  function getDocumentHeight() {
    return window.screen.availHeight;
  }
}

function initializeMouse() {
  var mouse = {
    clicked: false,
    currentX: 0,
    currentY: 0,
    initialX: 0,
    initialY: 0,
    mousedown: (x, y) => {
      mouse.clicked = true;
      mouse.initialX = x;
      mouse.initialY = y;
    },
    mousemove: (x, y) => {
      mouse.currentX = x; mouse.currentY = y;
    },
    mouseup: (x, y) => {
      mouse.clicked = false;
      chrome.runtime.sendMessage(
        {
          left : Math.min(mouse.initialX, mouse.currentX),
          top: Math.min(mouse.initialY, mouse.currentY),
          width: Math.abs(mouse.initialX - mouse.currentX),
          height: Math.abs(mouse.initialY - mouse.currentY)
        }
      );
    }
  };
  return mouse;
}

function screenshot() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(null, {}, null,
      response => resolve(JSON.parse(response))
    );
  });
}

function cropImage(dataURL, x1, y1, x2, y2) {
  var left = Math.min(x1, x2);
  var top = Math.min(y1, y2);
  var width = Math.abs(x1 - x2);
  var height = Math.abs(y1 - y2);

  return new Promise((resolve, reject) => {
    var canvas = document.createElement("canvas");
    var context = cropCanvas.getContext("2d");
    var image = new Image();
    canvas.width = width;
    canvas.height = height;
    image.onload = function(){
      context.drawImage(image, -left, -top);
      resolve(canvas.toDataURL());
    };
    image.src = dataURL;
  });
}

function search(dataURL) {
  var searchData = {
    imageDataURL: dataURL
  };
  chrome.tabs.create({
    url : '/html/result.html#' + JSON.stringify(searchData),
    active : false}
  );
}
