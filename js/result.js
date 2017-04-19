var data = JSON.parse(window.location.hash.substring(1));
var searchEngines = {
  "Google" : googleReverseImageSearch,
  "Tineye" : tineyeReverseImageSearch,
};
searchEngines[data.searchEngine](
  dataURLtoBlob(data.image),
  function(url) {
    window.location = url;
  }
);
