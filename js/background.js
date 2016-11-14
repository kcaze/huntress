// Copyright 2014-present Herman Chau.

/**
 * When the user clicks on the browser action, a message is sent to the current
 * tab to activate the Huntress UI in that tab.
 **/
chrome.browserAction.onClicked.addListener(tab => {
  sendToggleActiveMessage(tab.id, updateBrowserActionIcon);
});

/**
 * Update the browser icon when switching or refreshing tabs.
 **/
chrome.tabs.onActivated.addListener(updateBrowserActionIcon);
chrome.tabs.onUpdated.addListener(updateBrowserActionIcon);
chrome.windows.onFocusChanged.addListener(updateBrowserActionIcon);

/**
 * When the user selects a portion of the screen to crop and reverse image,
 * a message is sent from the content script of that page to this background
 * script which then handles the logic for taking the screenshot, cropping it,
 * and creating a new tab that loads the reverse image search result.
 **/
chrome.runtime.onMessage.addListener(
  function (message, sender, response) {
    screenshot()
    .then(dataURL => {
      return cropImage(
        dataURL,
        message.left, message.top,
        message.width, message.height);
    })
    .then(dataURL => search(dataURL));
  }
);

function screenshot() {
  return new Promise((resolve, reject) => {
    chrome.tabs.captureVisibleTab({format : 'png', quality: 100}, resolve);
  });
}

function cropImage(dataURL, left, top, width, height) {
  return new Promise((resolve, reject) => {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    var image = new Image();
    canvas.width = width;
    canvas.height = height;
    image.onload = function() {
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
    url : '/html/result.html#' + encodeURI(JSON.stringify(searchData)),
    active : false}
  );
}

function sendToggleActiveMessage(tabId, responseCallback) {
  chrome.tabs.sendMessage(
    tabId,
    {
      type: 'toggleActive',
      data: null
    },
    responseCallback
  );
}

function updateBrowserActionIcon() {
  chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  }, tabs => {
    sendQueryIsActive(tabs[0].id, isActive => {
      setBrowserActionIcon(isActive);
    });
  });
}

function sendQueryIsActive(tabId, responseCallback) {
  chrome.tabs.sendMessage(
    tabId,
    {
      type: 'queryIsActive',
      data: null
    },
    responseCallback
  );
}

function setBrowserActionIcon(isActive) {
  if (isActive) {
    chrome.browserAction.setTitle({
      title: 'Deactivate Huntress Reverse Image Search'
    });
    chrome.browserAction.setIcon({
      path: {
    	  '19' : '/icons/icon19_activated.png',
    	  '38' : '/icons/icon38_activated.png'
      }
    });
  } else {
    chrome.browserAction.setTitle({
      title: 'Activate Huntress Reverse Image Search'
    });
    chrome.browserAction.setIcon({
      path: {
    	  '19' : '/icons/icon19_deactivated.png',
    	  '38' : '/icons/icon38_deactivated.png'
      }
    });
  }
}
