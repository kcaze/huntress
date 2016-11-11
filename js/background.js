// Copyright 2014-present Herman Chau.

/**
 * When the user clicks on the browser action, a message is sent to the current
 * tab to activate the Huntress UI in that tab.
 **/
chrome.browserAction.onClicked.addListener(tab => {
  chrome.tabs.sendMessage(
    tab.id,
    {}
  );
});

/**
 * When the user selects a portion of the screen to crop and reverse image,
 * a message is sent from the content script of that page to this background
 * script which then handles the logic for taking the screenshot, cropping it,
 * and creating a new tab that loads the reverse image search result.
 **/
chrome.runtime.onMessage.addListener(
  function (message) {
    screenshot()
    .then(dataURL => cropImage(
      dataURL,
      message.left, message.top,
      message.width, message.height))
    .then(dataURL => search(dataURL));
  }
);

function screenshot() {
  return new Promise((resolve, reject) => {
    chrome.tabs.captureVisibleTab({format : 'png', quality: 100}, resolve);
  });
}

function cropImage(dataURL, left, top, width, height) {
  console.log(left, top, width, height);
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
    url : '/html/result.html#' + JSON.stringify(searchData),
    active : false}
  );
}
