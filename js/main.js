var isActive = false;
var canvas = initializeCanvas();
var mouse = initializeMouse();

canvas.setInvisible();
addOnMessageListener();

function initializeCanvas() {
  var canvas = document.createElement('canvas');
  canvas.style.all = 'initial';
  canvas.width = window.screen.availWidth;
  canvas.height = window.screen.availHeight;
  canvas.style.left = 0;
  canvas.style.top = 0;
  canvas.style.position = 'fixed';
  canvas.style.zIndex = 2147483647;  // best we can do :/
  canvas.style.cursor = 'crosshair';
  canvas.setVisible = setVisible;
  canvas.setInvisible = setInvisible;
  canvas.drawClear = drawClear;
  canvas.drawCropper = drawCropper;
  document.addEventListener("mousedown", makeEventListener("mousedown"));
  document.addEventListener("mousemove", makeEventListener("mousemove"));
  document.addEventListener("mouseup", makeEventListener("mouseup"));
  return canvas;

  function drawClear() {
    var context = canvas.getContext('2d');
    context.save();
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (mouse.clicked) {
      context.fillStyle = 'rgba(0, 0, 0, 0.75)';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
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
      if (!isActive) return;
      eventData.preventDefault();
      if (eventData.which != 1) return;
      mouse[eventType](eventData);
      canvas.drawClear();
      if (mouse.clicked) {
        canvas.drawCropper(
          mouse.initialClientX, mouse.initialClientY,
          mouse.currentClientX, mouse.currentClientY
        );
      }
    }
  }

  function setVisible() {
    document.body.append(canvas);
  }

  function setInvisible() {
    try {
      document.body.removeChild(canvas);
    } catch (e) {
    }
  }
}

function initializeMouse() {
  var mouse = {
    clicked: false,
    currentPageX: 0,
    currentPageY: 0,
    currentClientX: 0,
    currentClientY: 0,
    initialPageX: 0,
    initialPageY: 0,
    initialClientX: 0,
    initialClientY: 0,
    mousedown: eventData => {
      mouse.clicked = true;
      mouse.initialPageX = mouse.currentPageX = eventData.pageX;
      mouse.initialPageY = mouse.currentPageY = eventData.pageY;
      mouse.initialClientX = mouse.currentClientX = eventData.clientX;
      mouse.initialClientY = mouse.currentClientY = eventData.clientY;
    },
    mousemove: eventData => {
      mouse.currentPageX = eventData.pageX;
      mouse.currentPageY = eventData.pageY;
      mouse.currentClientX = eventData.clientX;
      mouse.currentClientY = eventData.clientY;
    },
    mouseup: eventData => {
      mouse.clicked = false;
      chrome.runtime.sendMessage(
        {
          left : window.devicePixelRatio * Math.min(mouse.initialClientX, mouse.currentClientX),
          top: window.devicePixelRatio * Math.min(mouse.initialClientY, mouse.currentClientY),
          width: window.devicePixelRatio * Math.abs(mouse.initialClientX - mouse.currentClientX),
          height: window.devicePixelRatio * Math.abs(mouse.initialClientY - mouse.currentClientY)
        }
      );
    }
  };
  return mouse;
}

function addOnMessageListener() {
  var messageHandlers = {
    toggleActive: onToggleActive,
    queryIsActive: onQueryIsActive
  };

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    messageHandlers[message.type](message.data, sender, sendResponse);
  });

  function onToggleActive(data, sender, sendResponse) {
    if (isActive) {
      isActive = false;
      canvas.setInvisible();
    } else {
      isActive = true;
      canvas.setVisible();
    }
  }

  function onQueryIsActive(data, sender, sendResponse) {
    sendResponse(isActive);
  }
}
