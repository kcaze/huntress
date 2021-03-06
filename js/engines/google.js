/*
 *
 * Copyright 2014, Herman Chau
 *
 */

// Given an imageBlob, reverse google image searches the blob and calls callback with the result's URL
function googleReverseImageSearch(imageBlob, callback) {
  var xhr = new XMLHttpRequest();
  var fd = new FormData();

  fd.append("encoded_image", imageBlob, "");
  xhr.open("POST", "http://images.google.com/searchbyimage/upload");

  xhr.onreadystatechange = function () {
    if (xhr.readyState==4) {
      // regex to extract URL of search result
      // Google redirects, and this is followed transparently, so we need to extract the URL this way
      var URL = xhr.response.match(/tbs=sbi:[^&]+/)[0];
      console.log(URL);
      callback("https://www.google.com/search?"+URL);
    }
  };
  xhr.send(fd);
}
