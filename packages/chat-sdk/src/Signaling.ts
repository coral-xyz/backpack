import { SERVER_URL } from "./config";
import EventEmitter from "eventemitter3";
import {
  CHAT_MESSAGES,
  FromServer,
  SUBSCRIBE,
  ToServer,
} from "@coral-xyz/common";

export const SIGNALING_CONNECTED = "SIGNALING_CONNECTED";

export class Signaling extends EventEmitter {
  ws: WebSocket;

  constructor(serverUrl = SERVER_URL) {
    super();
    this.initWs(`${serverUrl}?userId=123`);
  }

  initWs(serverUrl: string) {
    const ws = new WebSocket(serverUrl);
    ws.addEventListener("open", () => {
      this.emit(SIGNALING_CONNECTED);
    });

    ws.addEventListener("message", (event) => {
      console.log("message asdasd1 received");
      console.log(event.data);
      this.handleMessage(event.data);
    });

    this.ws = ws;
  }

  handleMessage(data: string) {
    try {
      const message: FromServer = JSON.parse(data);
      switch (message.type) {
        case CHAT_MESSAGES:
          this.emit(CHAT_MESSAGES, message.payload);
          break;
        default:
          console.error(`Invalid type of message found ${data}`);
      }
    } catch (e) {
      console.log(`Could not handle data from server ${data}, error: ${e}`);
    }
  }

  send(message: ToServer) {
    this.ws.send(
      JSON.stringify({
        ...message,
      })
    );
  }
}
