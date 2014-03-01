/*
 *
 * Copyright 2014, Herman Chau
 *
 */

tabs = {};

//Handle screenshotting
chrome.commands.onCommand.addListener(function (cmd) {
    if (cmd == "screenshot") {
      chrome.tabs.captureVisibleTab({format : "png"}, function (dataURL) {
        chrome.tabs.create({url : "main/screenshot.html"}, function(tab) {
          tabs[tab.id] = dataURL;
          console.log(dataURL);
        });
      });
    }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.request == "get image") {
    sendResponse(tabs[sender.tab.id]);
    delete tabs[sender.tab.id];
  }
});


// Create context menu for reverse googling image by URL.
chrome.contextMenus.create(
  {
    id : "@@extension_id",
    title : "Reverse Image Search", 
    contexts : ["image"]
  }
);

chrome.contextMenus.onClicked.addListener(function (info) {
  chrome.tabs.create({url : "http://images.google.com/searchbyimage?image_url="+info.srcUrl, active : false});
});
