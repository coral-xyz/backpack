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
import { updateLatestMessage } from "../db/friendships";

const chain = Chain(CHAT_HASURA_URL, {
  headers: {
    Authorization: `Bearer ${CHAT_JWT}`,
  },
});

export class Room {
  private users: Map<string, User>;
  private room: string;
  private type: SubscriptionType;
  private messageHistory: MessageWithMetadata[];
  private userIdMappings: Map<string, { username: string }> = new Map<
    string,
    { username: string }
  >();
  public roomCreationPromise: any;

  constructor(room: string, type: SubscriptionType) {
    this.room = room;
    this.type = type;
    this.users = new Map<string, User>();
    this.messageHistory = [];
    this.roomCreationPromise = this.init();
    console.log(`Room ${room} ${type} created`);
  }

  async init() {
    const response = await chain("query")({
      chats: [
        {
          limit: 50,
          offset: 0,
          //@ts-ignore
          order_by: [{ created_at: "desc" }],
          where: {
            room: { _eq: this.room.toString() },
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
          message_kind: true,
        },
      ],
    });

    this.messageHistory = await this.enrichMessages(
      response.chats?.sort((a, b) => (a.created_at < b.created_at ? -1 : 1)) ||
        []
    );
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
    //TODO: bulkify this
    chain("mutation")({
      insert_chats_one: [
        {
          object: {
            username: "",
            room: this.room.toString(),
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
    }).catch((e) => console.log(`Error while adding chat msg to DB ${e}`));

    if (this.type === "individual") {
      updateLatestMessage(
        parseInt(this.room),
        msg.message_kind === "gif" ? "GIF" : msg.message,
        userId
      );
    }

    const emittedMessage = (
      await this.enrichMessages([
        {
          id: 100000000,
          uuid: userId,
          message: msg.message,
          client_generated_uuid: msg.client_generated_uuid,
          message_kind: msg.message_kind,
        },
      ])
    )[0];
    this.messageHistory.push(emittedMessage);
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
