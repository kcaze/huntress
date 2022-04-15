// Given an imageBlob, reverse yandex image searches the blob and calls callback with the result's URL
function yandexReverseImageSearch(imageBlob, callback) {
  var xhr = new XMLHttpRequest();
  var fd = new FormData();

  const hostname = "yandex.com";
  const url =
    `https://${hostname}/images/touch/search?rpt=imageview&format=json` +
    `&request={"blocks":[{"block":"cbir-uploader__get-cbir-id"}]}`;

  fd.append("upfile", imageBlob);
  xhr.open("POST", url);
  xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  xhr.setRequestHeader(
    "Accept",
    "application/json, text/javascript, */*; q=0.01"
  );

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      const params = JSON.parse(xhr.responseText).blocks[0].params.url;
      const tabUrl = `https://${hostname}/images/search?${params}`;
      console.log(tabUrl);
      callback(tabUrl);
    }
  };
  xhr.send(fd);
}
