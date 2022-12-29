import type {
  EnrichedMessageWithMetadata,
  Message,
  MessageWithMetadata,
  SubscriptionType,
  ToServer,
} from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  CHAT_MESSAGES,
  EnrichedMessage,
  SendMessagePayload,
  SUBSCRIBE,
  UNSUBSCRIBE,
  WS_READY,
} from "@coral-xyz/common";

import { updateLastRead } from "../api";
import { bulkAddChats } from "../db/chats";
import { getFriendshipByRoom, updateFriendship } from "../db/friends";

import { RECONNECTING, Signaling } from "./Signaling";

const DEBOUNCE_INTERVAL_MS = 500;

export class SignalingManager {
  private static instance: SignalingManager;
  private signaling?: Signaling;
  private uuid = "";
  updateLastReadTimeout: { [room: string]: number };
  private postSubscribes: Set<{
    room: string;
    type: SubscriptionType;
    mint: string;
    publicKey: string;
  }> = new Set<{
    room: string;
    type: SubscriptionType;
    mint: string;
    publicKey: string;
  }>();

  private constructor() {}

  updateUuid(uuid: string) {
    this.signaling?.destroy();
    this.signaling = new Signaling(uuid);
    this.uuid = uuid;
    this.initHandlers();
    this.updateLastReadTimeout = {};
  }

  initHandlers() {
    this.signaling?.on(
      CHAT_MESSAGES,
      (payload: { messages: MessageWithMetadata[] }) => {
        bulkAddChats(
          this.uuid,
          payload.messages.map((chat) => ({
            ...chat,
            direction: this.uuid === chat.uuid ? "send" : "recv",
            received: true,
            from_http_server: 0,
          }))
        );
        payload.messages.forEach(async (message) => {
          if (message.type === "individual") {
            const friendship = await getFriendshipByRoom(
              this.uuid,
              parseInt(message.room)
            );
            console.log(friendship);
            if (friendship?.remoteUserId) {
              updateFriendship(this.uuid, friendship?.remoteUserId, {
                last_message_sender: message.uuid,
                last_message: message.message,
                last_message_timestamp: new Date().toISOString(),
                unread: 1,
              });
            }
          }
        });
      }
    );

    this.signaling?.on(WS_READY, () => {
      this.postSubscribes.forEach(({ room, type, mint, publicKey }) => {
        this.send({
          type: SUBSCRIBE,
          payload: {
            room,
            type,
            mint,
            publicKey,
          },
        });
      });
    });

    this.signaling?.on(RECONNECTING, () => {});
  }

  debouncedUpdateLastRead(latestMessage: EnrichedMessageWithMetadata) {
    if (latestMessage) {
      if (this.updateLastReadTimeout[latestMessage.room]) {
        window.clearTimeout(this.updateLastReadTimeout[latestMessage.room]);
      }
      this.updateLastReadTimeout[latestMessage.room] = window.setTimeout(() => {
        updateLastRead(
          this.uuid,
          latestMessage.client_generated_uuid,
          latestMessage.room,
          latestMessage.type,
          latestMessage.uuid
        );
      }, DEBOUNCE_INTERVAL_MS);
    }
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new SignalingManager();
    }
    return this.instance;
  }

  send(message: ToServer) {
    this.signaling?.send(message);
    if (message.type === CHAT_MESSAGES) {
      bulkAddChats(
        this.uuid,
        message.payload.messages.map((m) => ({
          ...m,
          direction: "send",
          from_http_server: 0,
          created_at: new Date().getTime().toString(),
          uuid: this.uuid,
          room: message.payload.room,
          type: message.payload.type,
        }))
      );
      message.payload.messages.forEach(async (m) => {
        if (message.payload.type === "individual") {
          const friendship = await getFriendshipByRoom(
            this.uuid,
            parseInt(message.payload.room)
          );
          if (friendship?.remoteUserId) {
            updateFriendship(this.uuid, friendship?.remoteUserId, {
              last_message_sender: this.uuid,
              last_message: m.message,
              last_message_timestamp: new Date().toISOString(),
              unread: 0,
            });
          }
        }
      });
    }
    if (message.type === SUBSCRIBE) {
      this.postSubscribes.add({
        room: message.payload.room,
        type: message.payload.type,
        mint: message.payload.mint || "",
        publicKey: message.payload.publicKey || "",
      });
    }
    if (message.type === UNSUBSCRIBE) {
      this.postSubscribes.delete({
        room: message.payload.room,
        type: message.payload.type,
        mint: message.payload.mint || "",
        publicKey: message.payload.publicKey || "",
      });
    }
  }
}
