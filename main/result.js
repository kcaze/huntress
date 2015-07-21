/*	
 *
 * Copyright 2014, Herman Chau
 *
 */

chrome.runtime.sendMessage({request : "get image"}, function (imgURL){
  var canvas = document.createElement("canvas"); 
  var ctx = canvas.getContext("2d");
  var image = new Image();
  image.onload = function() {
    canvas.width = this.width;
    canvas.height = this.height;
    ctx.drawImage(this, 0, 0);
    canvas.toBlob(function (imageBlob) {
      googleReverseImageSearch(imageBlob, function(url) {
        chrome.tabs.getCurrent(function (tab) {
          chrome.tabs.update(tab.id, {url:url});
        });
      });
    }, "image/jpeg", 0.5);
  };
  image.src = imgURL;
});
