// Copyright 2014-present Herman Chau.

var screenshotQueue = {};

// When a Huntress tab is created, it sends a request for the 
// screenshotted image. This message listener responds with the
// screenshot image data. 
chrome.runtime.onMessage.addListener(
  function (message, sender, sendResponse) {
    if (message.request == 'get screenshot') {
      sendResponse(screenshotQueue[sender.tab.id]);
      delete screenshotQueue[sender.tab.id];
    }
  }
);

function screenshotPage() {
  chrome.tabs.captureVisibleTab(
    {format : 'png', quality: 100}, 
    function (dataURL) {
      chrome.tabs.create(
        {url : '/html/huntress.html'}, 
        function(tab) {
          screenshotQueue[tab.id] = dataURL;
        });
    });
}

chrome.browserAction.onClicked.addListener(screenshotPage);

chrome.commands.onCommand.addListener(function (cmd) {
  if (cmd == 'screenshot') {
    screenshotPage();
  }
});

chrome.contextMenus.create({
  id : '@@extension_id',
  title : 'Reverse image search', 
  contexts : ['image']
});

chrome.contextMenus.onClicked.addListener(function (info) {
  chrome.tabs.create({
    url : "http://images.google.com/searchbyimage?image_url="+info.srcUrl, 
    active : false});
});

