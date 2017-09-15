console.log("I am background.js");
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.greeting == "hello") {
    sendResponse({ msg: "goodbye!" });
  }
});