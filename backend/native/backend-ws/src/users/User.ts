import type { FromServer, ToServer } from "@coral-xyz/common";
import {
  CHAT_MESSAGES,
  SUBSCRIBE,
  ToPubsub,
  UNSUBSCRIBE,
  WS_READY,
} from "@coral-xyz/common";
import type { SubscriptionType } from "@coral-xyz/common/dist/esm/messages/toServer";
import type WebSocket from "ws";

import { validateRoom } from "../db/friendships";
import { getNftCollections, validateCollectionOwnership } from "../db/nfts";
import { RedisSubscriptionManager } from "../subscriptions/RedisSubscriptionManager";

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

  private async initHandlers() {
    this.ws.on("message", async (data: string) => {
      // TODO: add rate limiting
      try {
        const message = JSON.parse(data);
        await this.handleMessage(message);
      } catch (e) {
        console.log("Could not parse message " + e);
      }
    });

    this.send({ type: WS_READY, payload: {} });
    RedisSubscriptionManager.getInstance().subscribe(
      this,
      `INDIVIDUAL_${this.userId}`
    );
    const collections = await getNftCollections(this.userId);
    const uniqueCollections = collections
      .filter((x, index) => collections.indexOf(x) === index)
      .filter((x) => x);

    uniqueCollections.forEach((c) =>
      RedisSubscriptionManager.getInstance().subscribe(this, `COLLECTION_${c}`)
    );
  }

  private async handleMessage(message: ToServer) {
    switch (message.type) {
      case CHAT_MESSAGES:
        const subscription = this.subscriptions.find(
          (x) =>
            x.room === message.payload.room && x.type === message.payload.type
        );
        if (!subscription) {
          console.log(
            `User has not yet post subscribed to the room ${message.payload.room}`
          );
          return;
        }
        message.payload.messages.map((m) => {
          RedisSubscriptionManager.getInstance().addChatMessage(
            this.id,
            this.userId,
            message.payload.room,
            message.payload.type,
            m
          );
        });
        break;
      case SUBSCRIBE:
        let roomValidation = false;
        if (message.payload.type === "individual") {
          // @ts-ignore
          roomValidation = await validateRoom(
            this.userId,
            //@ts-ignore (all individual rooms are stored as integers)
            message.payload.room as number
          );
          if (!roomValidation) {
            console.log(
              `User ${this.userId} doesn't have access to room ${message.payload.room} `
            );
            return;
          }
        } else {
          roomValidation = await validateCollectionOwnership(
            this.userId,
            message.payload.publicKey || "",
            message.payload.mint || "",
            message.payload.room
          );
        }

        this.subscriptions.push(message.payload);
        RedisSubscriptionManager.getInstance().postSubscribe(
          this.id,
          message.payload.type,
          message.payload.room,
          roomValidation
        );
        break;
      case UNSUBSCRIBE:
        this.subscriptions = this.subscriptions.filter(
          (x) =>
            x.room !== message.payload.room || x.type !== message.payload.type
        );
        RedisSubscriptionManager.getInstance().postUnsubscribe(
          this.id,
          message.payload.type,
          message.payload.room
        );
        break;
    }
  }

  send(message: FromServer) {
    this.ws.send(JSON.stringify(message));
  }

  destroy() {
    RedisSubscriptionManager.getInstance().userLeft(this.id);
    this.subscriptions.forEach((s) =>
      RedisSubscriptionManager.getInstance().postUnsubscribe(
        this.id,
        s.type,
        s.room
      )
    );
  }
}
