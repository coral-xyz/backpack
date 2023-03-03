import {
  deleteChat,
  enrichMessages,
  postChat,
  updateLatestMessage,
  updateLatestMessageGroup,
} from "@coral-xyz/backend-common";
import type {
  MessageKind,
  MessageMetadata,
  SubscriptionType,
  ToPubsub,
} from "@coral-xyz/common";
import { CHAT_MESSAGES, DELETE_MESSAGE } from "@coral-xyz/common";
import type { RedisClientType } from "redis";
import { createClient } from "redis";

import { REDIS_URL } from "../config";
import { Redis } from "../redis/Redis";
import type { User } from "../users/User";

export class RedisSubscriptionManager {
  private static instance: RedisSubscriptionManager;
  private subscriber: RedisClientType;
  public publisher: RedisClientType;
  private subscriptions: Map<string, string[]>;
  private reverseSubscriptions: Map<string, { [userId: string]: User }>;
  private postSubscriptions: Map<
    string,
    { user1: string; user2: string } | boolean
  >;

  private constructor() {
    this.subscriber = createClient({
      url: REDIS_URL,
    });
    this.publisher = createClient({
      url: REDIS_URL,
    });
    //TODO: add reconnection and buffering logic here?
    this.publisher.connect();
    this.subscriber.connect();
    this.subscriptions = new Map<string, string[]>();
    this.reverseSubscriptions = new Map<string, { [userId: string]: User }>();
    this.postSubscriptions = new Map<
      string,
      { user1: string; user2: string } | boolean
    >();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new RedisSubscriptionManager();
    }
    return this.instance;
  }

  subscribe(user: User, room: string) {
    this.subscriptions.set(user.id, [
      ...(this.subscriptions.get(user.id) || []),
      room,
    ]);
    this.reverseSubscriptions.set(room, {
      ...(this.reverseSubscriptions.get(room) || {}),
      [user.id]: user,
    });
    if (Object.keys(this.reverseSubscriptions.get(room) || {})?.length === 1) {
      console.log(`subscribing message from ${room}`);
      // This is the first subscriber to this room
      this.subscriber.subscribe(room, (payload) => {
        try {
          const parsedPayload: ToPubsub = JSON.parse(payload);
          const subscribers = this.reverseSubscriptions.get(room) || {};
          Object.values(subscribers).forEach((user) =>
            user.send(parsedPayload)
          );
        } catch (e) {
          console.error("erroneous payload found?");
        }
      });
    }
  }

  unsubscribe(userId: string, room: string) {
    this.subscriptions.set(
      userId,
      this.subscriptions.get(userId)?.filter((x) => x !== room) || []
    );
    if (this.subscriptions.get(userId)?.length === 0) {
      this.subscriptions.delete(userId);
    }
    delete this.reverseSubscriptions.get(room)?.[userId];
    if (
      !this.reverseSubscriptions.get(room) ||
      Object.keys(this.reverseSubscriptions.get(room) || {}).length === 0
    ) {
      this.subscriber.unsubscribe(room);
      this.reverseSubscriptions.delete(room);
    }
  }

  postSubscribe(
    id: string,
    type: SubscriptionType,
    room: string,
    roomValidation: { user1: string; user2: string } | boolean
  ) {
    this.postSubscriptions.set(`${id}-${type}-${room}`, roomValidation);
  }

  postUnsubscribe(id: string, type: SubscriptionType, room: string) {
    this.postSubscriptions.delete(`${id}-${type}-${room}`);
  }

  userLeft(userId: string) {
    const userSubscriptions = this.subscriptions.get(userId);
    userSubscriptions?.forEach((room) => this.unsubscribe(userId, room));
  }

  async deleteChatMessage(
    id: string,
    userId: string,
    room: string,
    type: SubscriptionType,
    clientGeneratedUuid: string
  ) {
    await deleteChat(clientGeneratedUuid, room);
    const roomValidation =
      this.postSubscriptions.get(`${id}-${type}-${room}`) ?? null;

    const emittedMessage = {
      client_generated_uuid: clientGeneratedUuid,
      room,
      type,
    };

    if (type === "individual") {
      this.publish(`INDIVIDUAL_${roomValidation?.user2}`, {
        type: DELETE_MESSAGE,
        payload: emittedMessage,
      });
      this.publish(`INDIVIDUAL_${roomValidation?.user1}`, {
        type: DELETE_MESSAGE,
        payload: emittedMessage,
      });
    } else {
      this.publish(`COLLECTION_${room}`, {
        type: DELETE_MESSAGE,
        payload: emittedMessage,
      });
    }
  }

  async addChatMessage(
    id: string,
    userId: string,
    room: string,
    type: SubscriptionType,
    msg: {
      client_generated_uuid: string;
      message: string;
      message_kind: MessageKind;
      parent_client_generated_uuid?: string;
      message_metadata?: MessageMetadata;
    }
  ) {
    const roomValidation =
      this.postSubscriptions.get(`${id}-${type}-${room}`) ?? null;
    // if (!roomValidation) {
    //     console.log(`User ${id} hasn't post subscribed to room number ${id}, type: ${type}`);
    //     return;
    // }
    //TODO: bulkify this
    postChat(
      room.toString(),
      msg.message,
      userId,
      msg.message_kind,
      msg.client_generated_uuid,
      type,
      msg.message_metadata,
      msg.parent_client_generated_uuid
    );

    if (type === "individual") {
      updateLatestMessage(
        parseInt(room),
        msg.message_kind === "gif"
          ? "GIF"
          : msg.message_kind === "secure-transfer"
          ? "Secure Transfer"
          : msg.message_kind === "media"
          ? "Media"
          : msg.message,
        userId,
        roomValidation,
        msg.client_generated_uuid
      );
    } else {
      updateLatestMessageGroup(
        room,
        msg.message_kind === "gif"
          ? "GIF"
          : msg.message_kind === "secure-transfer"
          ? "Secure Transfer"
          : msg.message_kind === "media"
          ? "Media"
          : msg.message,
        msg.client_generated_uuid
      );
    }

    const emittedMessage = (
      await enrichMessages(
        [
          {
            uuid: userId,
            message: msg.message,
            client_generated_uuid: msg.client_generated_uuid,
            message_kind: msg.message_kind,
            parent_client_generated_uuid: msg.parent_client_generated_uuid,
            created_at: new Date().toString(),
            room,
            type,
            message_metadata: {
              ...msg.message_metadata,
              current_state:
                msg.message_kind === "secure-transfer" ? "pending" : undefined,
            },
          },
        ],
        room,
        type,
        true
      )
    )[0];

    if (type === "individual") {
      this.publish(`INDIVIDUAL_${roomValidation?.user2}`, {
        type: CHAT_MESSAGES,
        payload: {
          messages: [emittedMessage],
        },
      });
      this.publish(`INDIVIDUAL_${roomValidation?.user1}`, {
        type: CHAT_MESSAGES,
        payload: {
          messages: [emittedMessage],
        },
      });
    } else {
      this.publish(`COLLECTION_${room}`, {
        type: CHAT_MESSAGES,
        payload: {
          messages: [emittedMessage],
        },
      });
    }

    setTimeout(async () => {
      await Redis.getInstance().send(
        JSON.stringify({
          type: "message",
          payload: {
            type: type,
            room: room,
            client_generated_uuid: msg.client_generated_uuid,
          },
        })
      );
    }, 1000);
  }

  publish(room: string, message: ToPubsub) {
    console.log(`publishing message to ${room}`);
    this.publisher.publish(room, JSON.stringify(message));
  }
}
