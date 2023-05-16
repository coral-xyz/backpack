import {
  getChatFromClientGeneratedUuid,
  validateMessageOwnership,
  validateRoom,
} from "@coral-xyz/backend-common";
import type { FromServer, ToServer } from "@coral-xyz/common";
import {
  BACKPACK_TEAM,
  CHAT_MESSAGES,
  DEFAULT_GROUP_CHATS,
  DELETE_MESSAGE,
  SUBSCRIBE,
  UNSUBSCRIBE,
  WHITELISTED_CHAT_COLLECTIONS,
  WS_READY,
} from "@coral-xyz/common";
import type { SubscriptionType } from "@coral-xyz/common/dist/esm/messages/toServer";
import type WebSocket from "ws";
const NSFW_VALIDATION_SERVER = "https://nsfw-check.xnfts.dev";

import {
  getNftCollections,
  validateCentralizedGroupOwnership,
  validateCollectionOwnership,
} from "../db/nfts";
import { RedisSubscriptionManager } from "../subscriptions/RedisSubscriptionManager";

function isValidURL(str: string): boolean {
  const pattern = new RegExp(
    "^(https?:\\/\\/)?" +
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" +
      "((\\d{1,3}\\.){3}\\d{1,3}))" +
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
      "(\\?[;&a-z\\d%_.~+=-]*)?" +
      "(\\#[-a-z\\d_]*)?$",
    "i"
  );
  return !!pattern.test(str);
}

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
    DEFAULT_GROUP_CHATS.forEach(({ id }) =>
      RedisSubscriptionManager.getInstance().subscribe(this, `COLLECTION_${id}`)
    );
  }

  private async handleMessage(message: ToServer) {
    switch (message.type) {
      case CHAT_MESSAGES:
        let nsfwImage = false;
        await Promise.all(
          message.payload.messages.map(async (x) => {
            // @ts-ignore
            if (
              x.message_kind === "media" &&
              x.message_metadata?.media_kind === "image"
            ) {
              try {
                if (
                  !isValidURL(x.message_metadata?.media_link) ||
                  !x.message_metadata?.media_link
                    .lower()
                    .endswith(
                      (".jpg",
                      ".jpeg",
                      ".png",
                      ".gif",
                      ".bmp",
                      ".tif",
                      ".tiff",
                      ".webp")
                    )
                ) {
                  nsfwImage = true;
                }
                const res = await fetch(`${NSFW_VALIDATION_SERVER}/validate`, {
                  method: "post",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    // @ts-ignore
                    url: x.message_metadata?.media_link,
                  }),
                });
                const json = await res.json();
                if (json.success === false) {
                  nsfwImage = true;
                }
              } catch (e) {
                console.error("nsfw server down?");
              }
            }
          })
        );

        if (nsfwImage) {
          return;
        }

        const subscription = this.subscriptions.find(
          (x) =>
            x.room === message.payload.room && x.type === message.payload.type
        );
        if (!subscription) {
          await this.validateOwnership(
            message.payload.room,
            message.payload.type,
            message.payload.publicKey,
            message.payload.mint
          );
          const updatedSubs = this.subscriptions.find(
            (x) =>
              x.room === message.payload.room && x.type === message.payload.type
          );
          if (!updatedSubs) {
            console.log(
              `User has not yet post subscribed to the room ${message.payload.room}`
            );
            return;
          }
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
      case DELETE_MESSAGE:
        //TODO: merge the subscription section into a single fn
        const subscription2 = this.subscriptions.find(
          (x) =>
            x.room === message.payload.room && x.type === message.payload.type
        );
        if (!subscription2) {
          await this.validateOwnership(
            message.payload.room,
            message.payload.type,
            message.payload.publicKey,
            message.payload.mint
          );
          const updatedSubs = this.subscriptions.find(
            (x) =>
              x.room === message.payload.room && x.type === message.payload.type
          );
          if (!updatedSubs) {
            console.log(
              `User has not yet post subscribed to the room ${message.payload.room}`
            );
            return;
          }
        }

        const messageDetails = await getChatFromClientGeneratedUuid(
          message.payload.client_generated_uuid
        );
        if (
          !messageDetails ||
          !BACKPACK_TEAM.includes(
            this.userId
          ) /* messageDetails.uuid !== this.userId */
        ) {
          console.error(
            `Someone sending errorneous input sending uuid ${messageDetails?.uuid} for ${message.payload.client_generated_uuid}`
          );
          return;
        }
        RedisSubscriptionManager.getInstance().deleteChatMessage(
          this.id,
          this.userId,
          messageDetails.room,
          messageDetails.type,
          messageDetails.client_generated_uuid
        );
        break;
      case SUBSCRIBE:
        if (
          this.subscriptions.find(
            (x) =>
              x.room === message.payload.room && x.type === message.payload.type
          )
        ) {
          return;
        }
        await this.validateOwnership(
          message.payload.room,
          message.payload.type,
          message.payload.publicKey,
          message.payload.mint
        );
        break;
    }
  }

  async validateOwnership(
    room: string,
    type: SubscriptionType,
    publicKey?: string,
    mint?: string
  ) {
    let roomValidation = false;
    if (type === "individual") {
      // @ts-ignore
      roomValidation = await validateRoom(
        this.userId,
        //@ts-ignore (all individual rooms are stored as integers)
        room as number
      );
      if (!roomValidation) {
        console.log(`User ${this.userId} doesn't have access to room ${room} `);
        return;
      }
    } else {
      if (DEFAULT_GROUP_CHATS.map((x) => x.id).includes(room)) {
        roomValidation = true;
      } else if (WHITELISTED_CHAT_COLLECTIONS.map((x) => x.id).includes(room)) {
        roomValidation = await validateCentralizedGroupOwnership(
          this.userId,
          room
        );
      } else {
        roomValidation = await validateCollectionOwnership(this.userId, room);
      }
    }
    if (roomValidation) {
      this.subscriptions.push({
        type,
        room,
      });
      RedisSubscriptionManager.getInstance().postSubscribe(
        this.id,
        type,
        room,
        roomValidation
      );
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
