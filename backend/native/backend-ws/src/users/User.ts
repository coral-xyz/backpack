import WebSocket from "ws";
import {
  CHAT_MESSAGES,
  SUBSCRIBE,
  UNSUBSCRIBE,
  FromServer,
  ToServer,
} from "@coral-xyz/common";
import { SubscriptionManager } from "../subscriptions/SubscriptionManager";
import { SubscriptionType } from "@coral-xyz/common/dist/esm/messages/toServer";

export class User {
  id: string;
  userId: string;
  ws: WebSocket;
  subscriptions: {
    type: SubscriptionType;
    room: string;
  }[] = [];

  constructor(id: string, userId: string, ws: WebSocket) {
    this.id = id;
    this.ws = ws;
    this.userId = userId;
    this.initHandlers();
  }

  private initHandlers() {
    this.ws.on("message", (data: string) => {
      console.log(data);
      try {
        const message = JSON.parse(data);
        this.handleMessage(message);
      } catch (e) {
        console.log("Could not parse message " + e);
      }
    });
  }

  private async handleMessage(message: ToServer) {
    switch (message.type) {
      case CHAT_MESSAGES:
        SubscriptionManager.getInstance().process(
          this.id,
          this.userId,
          message
        );
        break;
      case SUBSCRIBE:
        this.subscriptions.push(message.payload);
        await SubscriptionManager.getInstance().subscribe(
          this,
          message.payload
        );
        break;
      case UNSUBSCRIBE:
        this.subscriptions = this.subscriptions.filter(
          (x) =>
            x.room !== message.payload.room || x.type !== message.payload.type
        );
        await SubscriptionManager.getInstance().unsubscribe(
          this,
          message.payload
        );
        break;
    }
  }

  send(message: FromServer) {
    this.ws.send(JSON.stringify(message));
  }

  destroy() {
    this.subscriptions.forEach((subscription) =>
      SubscriptionManager.getInstance().unsubscribe(this, subscription)
    );
  }
}
