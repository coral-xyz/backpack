import { Room } from "./Room";
import { User } from "../users/User";
import {
  CHAT_MESSAGES,
  SUBSCRIBE,
  SubscriptionMessage,
  SubscriptionType,
  ToServer,
} from "@coral-xyz/common";

export class SubscriptionManager {
  private static instance: SubscriptionManager;
  private subscriptions: Map<string, Room>;

  static getInstance() {
    if (!this.instance) {
      this.instance = new SubscriptionManager();
    }
    return this.instance;
  }

  private constructor() {
    this.subscriptions = new Map<string, Room>();
  }

  async subscribe(
    user: User,
    payload: {
      type: SubscriptionType;
      room: string;
    }
  ) {
    const roomId = this.subscriptionToRoomMapping(
      user.userId,
      payload.type,
      payload.room
    );
    if (!this.subscriptions.get(roomId)) {
      const room = new Room(payload.room, payload.type);
      await room.init();
      this.subscriptions.set(roomId, room);
    }
    const room = this.subscriptions.get(roomId);
    room?.addUser(user);
  }

  async unsubscribe(
    user: User,
    payload: {
      type: SubscriptionType;
      room: string;
    }
  ) {
    const roomId = this.subscriptionToRoomMapping(
      user.userId,
      payload.type,
      payload.room
    );
    const room = this.subscriptions.get(roomId);
    room?.removeUser(user);
    if (room?.isEmpty()) {
      room?.destroy();
      this.subscriptions.delete(roomId);
    }
  }

  process(id: string, userId: string, message: ToServer) {
    switch (message.type) {
      case CHAT_MESSAGES:
        const roomId = this.subscriptionToRoomMapping(
          userId,
          message.payload.type,
          message.payload.room
        );
        const room = this.subscriptions.get(roomId);
        // TODO: bulkify?
        message.payload.messages.map((message) => {
          room?.addChatMessage(id, userId, message);
        });
        break;
    }
  }

  subscriptionToRoomMapping(
    userId: string,
    type: SubscriptionType,
    room: string
  ) {
    if (type === "collection") {
      return `COLLECTION_${room}`;
    }
    if (userId < room) {
      return `INDIVIDUAL_${userId}_${room}`;
    }
    return `INDIVIDUAL_${room}_${userId}`;
  }
}
