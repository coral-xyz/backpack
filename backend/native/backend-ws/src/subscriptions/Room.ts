import { User } from "../users/User";
import { HASURA_URL, JWT } from "../config";
import { Chain, order_by } from "../zeus/index";
import {
  CHAT_MESSAGES,
  FromServer,
  Message,
  SubscriptionType,
} from "@coral-xyz/common";

const chain = Chain(HASURA_URL, {
  headers: {
    Authorization: `Bearer ${JWT}`,
  },
});

export class Room {
  private users: Map<string, User>;
  private room: string;
  private type: SubscriptionType;
  private messageHistory: Message[];

  constructor(room: string, type: SubscriptionType) {
    this.room = room;
    this.type = type;
    this.users = new Map<string, User>();
    this.messageHistory = [];
  }

  async init() {
    const response = await chain("query")({
      chats: [
        {
          limit: 50,
          order_by: [{ id: order_by.asc }],
          where: {
            room: { _eq: this.room },
            type: { _eq: this.type },
          },
        },
        {
          id: true,
          username: true,
          uuid: true,
          message: true,
          client_generated_uuid: true,
          created_at: true,
        },
      ],
    });

    this.messageHistory = response.chats;
  }

  addUser(user: User) {
    this.users.set(user.id, user);
    user.send({
      type: CHAT_MESSAGES,
      payload: {
        messages: this.messageHistory,
        type: this.type,
        room: this.room,
      },
    });
  }

  async addChatMessage(
    id: string,
    userId: string,
    msg: { client_generated_uuid: string; message: string }
  ) {
    const response = await chain("mutation")({
      insert_chats_one: [
        {
          object: {
            username: "",
            room: this.room,
            message: msg.message,
            uuid: userId,
            client_generated_uuid: msg.client_generated_uuid,
            type: this.type,
            created_at: new Date(),
          },
        },
        {
          id: true,
        },
      ],
    });
    const emittedMessage = {
      id: response.insert_chats_one?.id || 100000000,
      username: "",
      uuid: userId,
      message: msg.message,
      client_generated_uuid: msg.client_generated_uuid,
    };
    this.messageHistory.push(emittedMessage);
    //splice here?
    this.messageHistory = this.messageHistory.slice(-50);
    this.broadcast(null, {
      type: CHAT_MESSAGES,
      payload: {
        messages: [emittedMessage],
        type: this.type,
        room: this.room,
      },
    });
  }

  broadcast(userToSkip: string | null, msg: FromServer) {
    this.users.forEach((user) => {
      if (user.id === userToSkip) {
        return;
      }
      user.send(msg);
    });
  }

  removeUser(user: User) {
    this.users.delete(user.id);
  }

  destroy() {
    this.messageHistory = [];
  }

  isEmpty() {
    return this.users.size === 0;
  }
}
