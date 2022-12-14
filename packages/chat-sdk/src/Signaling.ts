import { SERVER_HTTP_URL, SERVER_URL } from "./config";
import EventEmitter from "eventemitter3";
import {
  CHAT_MESSAGES,
  FromServer,
  ToServer,
  WS_READY,
} from "@coral-xyz/common";

export const SIGNALING_CONNECTED = "SIGNALING_CONNECTED";

export class Signaling extends EventEmitter {
  ws: WebSocket;

  constructor() {
    super();
  }

  async initWs() {
    const res = await fetch(`${SERVER_HTTP_URL}/cookie`);
    const jwt = (await res.json()).jwt;
    const ws = new WebSocket(`${SERVER_URL}?jwt=${jwt}`);
    ws.addEventListener("open", () => {
      // this.emit(SIGNALING_CONNECTED);
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
        case WS_READY:
          this.emit(SIGNALING_CONNECTED);
          break;
        default:
          console.error(`Invalid type of message found ${data}`);
      }
    } catch (e) {
      console.log(`Could not handle data from server ${data}, error: ${e}`);
    }
  }

  destroy() {
    this.ws.close();
  }

  send(message: ToServer) {
    this.ws.send(
      JSON.stringify({
        ...message,
      })
    );
  }
}
