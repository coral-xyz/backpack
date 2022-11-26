import { User } from "../users/User";
import { CHAT_HASURA_URL, CHAT_JWT } from "../config";
import { Chain } from "@coral-xyz/chat-zeus";

import {
  CHAT_MESSAGES,
  FromServer,
  Message,
  MessageWithMetadata,
  SubscriptionType,
} from "@coral-xyz/common";
import { getUsers } from "../db/users";

const chain = Chain(CHAT_HASURA_URL, {
  headers: {
    Authorization: `Bearer ${CHAT_JWT}`,
  },
});

export class Room {
  private users: Map<string, User>;
  private room: string;
  private type: SubscriptionType;
  private messageHistory: Message[];
  private userIdMappings: Map<string, { username: string }> = new Map<
    string,
    { username: string }
  >();

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
          //@ts-ignore
          order_by: [{ id: "asc" }],
          where: {
            room: { _eq: this.room },
            //@ts-ignore
            type: { _eq: this.type },
          },
        },
        {
          id: true,
          uuid: true,
          message: true,
          client_generated_uuid: true,
          created_at: true,
        },
      ],
    });

    this.messageHistory = response.chats || [];
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
    msg: {
      client_generated_uuid: string;
      message: string;
      message_kind: string;
    }
  ) {
    const response = await chain("mutation")({
      insert_chats_one: [
        {
          object: {
            username: "",
            room: this.room,
            message: msg.message,
            uuid: userId,
            message_kind: msg.message_kind,
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
      message_kind: msg.message_kind,
    };
    this.messageHistory.push(emittedMessage);
    this.messageHistory = this.messageHistory.slice(-10);
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

  async enrichMessages(messages: Message[]): Promise<MessageWithMetadata[]> {
    const userIds: string[] = messages.map((m) => m.uuid || "");
    const uniqueUserIds = userIds
      .filter((x, index) => userIds.indexOf(x) === index)
      .filter((x) => !this.userIdMappings.get(x || ""));

    if (uniqueUserIds.length) {
      const metadatas = await getUsers(uniqueUserIds);
      metadatas.forEach(({ id, username }) =>
        this.userIdMappings.set(id, { username })
      );
    }

    return messages.map((message) => {
      const username =
        this.userIdMappings.get(message.uuid || "")?.username || "";
      const image = `https://avatars.xnfts.dev/v1/${username}`;
      return {
        ...message,
        username,
        image,
      };
    });
  }

  removeUser(user: User) {
    this.users.delete(user.id);
  }

  destroy() {
    console.log(`Room ${this.room} ${this.type} destroyed`);
    this.messageHistory = [];
  }

  isEmpty() {
    return this.users.size === 0;
  }
}
