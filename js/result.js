var data = JSON.parse(decodeURI(window.location.hash.substring(1)));
if (data.engine === "yandex") {
  yandexReverseImageSearch(dataURLtoBlob(data.imageDataURL), function (url) {
    window.location = url;
  });
}
if (data.engine === "google") {
  googleReverseImageSearch(dataURLtoBlob(data.imageDataURL), function (url) {
    window.location = url;
  });
}
