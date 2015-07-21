/*
 *
 * Copyright 2014, Herman Chau
 *
 */

var tabs = {};

// When a huntress tab is created, it sends a request for the 
// screenshotted image. This message listener responds with the
// screenshot image data. 
chrome.runtime.onMessage.addListener(
  function (message, sender, sendResponse) {
    if (message.request == "get screenshot") {
      sendResponse(tabs[sender.tab.id]);
      delete tabs[sender.tab.id];
    }
  }
);

//Handle screenshotting
function screenshotPage() {
  chrome.tabs.captureVisibleTab({format : "png"}, function (dataURL) {
    chrome.tabs.create({url : "main/screenshot.html"}, function(tab) {
      tabs[tab.id] = dataURL;
    });
  });
}

// Add keyboard command listener.
chrome.commands.onCommand.addListener(function (cmd) {
  if (cmd == "screenshot") {
    screenshotPage();
  }
});

// Add context menu and listener.
chrome.contextMenus.create(
  {
    id : "@@extension_id",
    title : "Reverse image search", 
    contexts : ["image"]
  }
);

chrome.contextMenus.onClicked.addListener(function (info) {
  chrome.tabs.create({url : "http://images.google.com/searchbyimage?image_url="+info.srcUrl, active : false});
});

// Add browser action listener.
chrome.browserAction.onClicked.addListener(screenshotPage);
