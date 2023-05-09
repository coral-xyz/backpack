import type { FromServer, ToServer } from "@coral-xyz/common";
import {
  CHAT_MESSAGES,
  DELETE_MESSAGE,
  EXECUTE_BARTER,
  NOTIFICATION_ADD,
  REALTIME_WS_URL,
  UPDATE_ACTIVE_BARTER,
  WS_READY,
} from "@coral-xyz/common";
import EventEmitter from "eventemitter3";

export const SIGNALING_CONNECTED = "SIGNALING_CONNECTED";
export const RECONNECTING = "RECONNECTING";

export class Signaling extends EventEmitter {
  ws: WebSocket;
  destroyed = false;
  jwt: string;
  uuid: string;
  private bufferedMessages: ToServer[] = [];
  private state: "connected" | "disconnected" = "disconnected";

  constructor(uuid: string, jwt: string) {
    super();
    this.uuid = uuid;
    this.jwt = jwt;
    this.initWs();
  }

  async initWs() {
    try {
      const ws = new WebSocket(`${REALTIME_WS_URL}?jwt=${this.jwt}`);
      ws.addEventListener("open", () => {
        this.state = "connected";
        this.bufferedMessages.forEach((x) => this.send(x));
        this.bufferedMessages = [];
      });

      ws.addEventListener("message", (event) => {
        this.handleMessage(event.data);
      });

      ws.addEventListener("close", () => {
        this.state = "disconnected";
        if (!this.destroyed) {
          this.emit(RECONNECTING);
          setTimeout(() => {
            // TODO: exponentially backoff here
            if (!this.destroyed) {
              this.initWs();
            }
          }, 3000);
        }
      });

      this.ws = ws;
    } catch (e) {
      console.error("Error while creating ws connection");
      console.error(e);
    }
  }

  handleMessage(data: string) {
    try {
      const message: FromServer = JSON.parse(data);
      switch (message.type) {
        case CHAT_MESSAGES:
          this.emit(CHAT_MESSAGES, message.payload);
          break;
        case UPDATE_ACTIVE_BARTER:
          this.emit(UPDATE_ACTIVE_BARTER, message.payload);
          break;
        case EXECUTE_BARTER:
          this.emit(EXECUTE_BARTER, message.payload);
          break;
        case WS_READY:
          this.emit(SIGNALING_CONNECTED);
          break;
        case NOTIFICATION_ADD:
          this.emit(NOTIFICATION_ADD, message.payload);
          break;
        case DELETE_MESSAGE:
          this.emit(DELETE_MESSAGE, message.payload);
          break;
        default:
          console.error(`Invalid type of message found ${data}`);
      }
    } catch (e) {
      console.log(`Could not handle data from server ${data}, error: ${e}`);
    }
  }

  destroy() {
    this.destroyed = true;
    this.ws?.close();
  }

  send(message: ToServer) {
    if (this.state === "disconnected") {
      this.bufferedMessages.push(message);
      return;
    }
    this.ws.send(
      JSON.stringify({
        ...message,
      })
    );
  }
}
