/*
 *
 * Copyright 2014, Herman Chau
 *
 */

// Given an imageBlob, reverse google image searches the blob and calls callback with the result's URL
function tineyeReverseImageSearch(imageBlob, callback) {
  var xhr = new XMLHttpRequest();
  var fd = new FormData();

  fd.append("image", imageBlob, "image.png");
  xhr.open("POST", "http://tineye.com/search");

  xhr.onreadystatechange = function () {
    if (xhr.readyState==4) {
      // regex to extract the image hash
      var hash = xhr.response.match(/query\/[0-9a-z]*/)[0].substring(6);
      callback("http://www.tineye.com/search/"+hash);
    }
  };
  xhr.send(fd);
}
