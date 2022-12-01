import WebSocket from "ws";
import {
  CHAT_MESSAGES,
  SUBSCRIBE,
  UNSUBSCRIBE,
  FromServer,
  ToServer,
  WS_READY,
} from "@coral-xyz/common";
import { SubscriptionManager } from "../subscriptions/SubscriptionManager";
import { SubscriptionType } from "@coral-xyz/common/dist/esm/messages/toServer";
import { validateRoom } from "../db/friendships";

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
      try {
        const message = JSON.parse(data);
        this.handleMessage(message);
      } catch (e) {
        console.log("Could not parse message " + e);
      }
    });
    this.send({ type: WS_READY, payload: {} });
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
        let roomValidation = null;
        if (message.payload.type === "individual") {
          // @ts-ignore
          roomValidation = await validateRoom(
            this.userId,
            message.payload.room as number
          );
          if (!roomValidation) {
            console.log(
              `User ${this.userId} doesn't have access to room ${message.payload.room} `
            );
            return;
          }
        }

        if (message.payload.type === "collection") {
          // TODO: auth check for collection post #1589
        }

        this.subscriptions.push(message.payload);
        await SubscriptionManager.getInstance().subscribe(
          this,
          message.payload,
          roomValidation
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
