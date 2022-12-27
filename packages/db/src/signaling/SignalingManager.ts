import type {
  MessageWithMetadata,
  ToServer} from "@coral-xyz/common";
import {
  CHAT_MESSAGES,
  SendMessagePayload,
  WS_READY,
} from "@coral-xyz/common";

import { bulkAddChats } from "../db/chats";

import { RECONNECTING, Signaling } from "./Signaling";

export class SignalingManager {
  private static instance: SignalingManager;
  private signaling?: Signaling;
  private uuid = "";

  private constructor() {}

  updateUuid(uuid: string) {
    this.signaling?.destroy();
    this.signaling = new Signaling(uuid);
    this.uuid = uuid;
    this.initHandlers();
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
            from_http_server: false,
          }))
        );
      }
    );

    this.signaling?.on(WS_READY, () => {});

    this.signaling?.on(RECONNECTING, () => {});
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new SignalingManager();
    }
    return this.instance;
  }

  send(message: ToServer) {
    this.signaling?.send(message);
  }
}
