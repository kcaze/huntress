var data = JSON.parse(window.location.hash.substring(1));
googleReverseImageSearch(
  dataURLtoBlob(data.image),
  function(url) {
    window.location = url;
  }
);
