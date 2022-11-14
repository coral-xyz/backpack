import { start } from "@coral-xyz/background";

const _handle = start({
  isMobile: false,
});

//@ts-ignore
let ws;

function openSocket() {
  ws = new WebSocket("ws://localhost:8001");

  ws.onopen = function () {
    // chrome.browserAction.setIcon({ "path": "icon_blue.png" });
    // chrome.browserAction.setBadgeText({ "text": "" });
  };

  ws.onmessage = function (e) {
    //
    // setTimeout(function() {
    //   notify.cancel();
    // },3000);
  };

  ws.onclose = function (e) {
    ws = undefined;

    // chrome.browserAction.setIcon({ "path": "icon_red.png" });
    // chrome.browserAction.setBadgeText({ "text": "!" });
  };
  //
  // setInterval(() => {
  //   //@ts-ignore
  //   if (ws) {
  //     //@ts-ignore
  //     ws.send('send text');
  //   }
  // }, 1000)
}

(function () {
  openSocket();

  // chrome.browserAction.onClicked.addListener(function() {
  //   //@ts-ignore
  //   if (ws === undefined) {
  //     openSocket();
  //   } else {
  //     //@ts-ignore
  //     if (ws.readyState === WebSocket.OPEN) {
  //       //@ts-ignore
  //       ws.send(prompt('send text'));
  //     }
  //   }
  // });
})();
