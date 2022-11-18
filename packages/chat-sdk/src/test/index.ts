import { ChatManager } from "../ChatManager";

const chatManager = new ChatManager("room1", (messages) => {
  console.log("messsage received " + messages);
});

(async () => {
  await chatManager.send("hi there");
  await chatManager.send("hello");
  await new Promise((resolve) => {});
})();
