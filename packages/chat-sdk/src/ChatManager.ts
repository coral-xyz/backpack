import { Subscription } from "./subscriptionManager";
import { Chain, SubscriptionToGraphQL } from "./zeus/index";
import { HASURA_URL, HASURA_WS_URL, JWT } from "./config";
import { v4 as uuidv4 } from "uuid";

export interface Message {
  id: number;
  username?: string;
  uuid?: string;
  message?: string;
  received?: boolean;
  direction: "send" | "recv";
  client_generated_uuid?: string;
}

export class ChatManager {
  private roomId: string;
  private userId: string;
  private username: string;
  private onMessages: (messages: Message[]) => void;
  private onLocalMessageReceived: (messages: Message[]) => void;
  private subscription?: any;
  private sendQueue: { [client_generated_uuid: string]: boolean } = {};

  constructor(
    userId: string,
    username: string,
    roomId: string,
    onMessages: (messages: Message[]) => void,
    onLocalMessageReceived: (messages: Message[]) => void
  ) {
    this.roomId = roomId;
    this.userId = userId;
    this.username = username;
    this.onMessages = onMessages;
    this.onLocalMessageReceived = onLocalMessageReceived;
    this.subscribeIncomingMessages();
  }

  async subscribeIncomingMessages() {
    const wsChain = Subscription(HASURA_WS_URL, {
      get headers() {
        return { Authorization: `Bearer ${JWT}` };
      },
    });

    const subscription = wsChain("subscription")({
      chats: [
        { limit: 50 },
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

    let lastChatIndex = -1;
    subscription.on(({ chats }) => {
      //TODO: add binary search here?
      const filteredChats: Message[] = [];
      const filteredReceived: Message[] = [];
      for (let i = 0; i < chats.length; i++) {
        if (chats[i].id > lastChatIndex) {
          lastChatIndex = chats[i].id;
          if (this.sendQueue[chats[i].client_generated_uuid || ""]) {
            delete this.sendQueue[chats[i].client_generated_uuid || ""];
            filteredReceived.push({
              ...chats[i],
              direction: this.userId === chats[i].uuid ? "send" : "recv",
            });
          } else {
            filteredChats.push({
              ...chats[i],
              direction: this.userId === chats[i].uuid ? "send" : "recv",
              received: true,
            });
          }
        }
      }
      if (filteredChats.length) {
        this.onMessages(filteredChats);
      }
      if (filteredReceived.length) {
        this.onLocalMessageReceived(filteredReceived);
      }
    });

    this.subscription = subscription;
  }

  async send(message: string, client_generated_uuid: string) {
    this.sendQueue[client_generated_uuid] = true;
    const chain = Chain(HASURA_URL, {
      headers: {
        Authorization: `Bearer ${JWT}`,
      },
    });

    await chain("mutation")({
      insert_chats_one: [
        {
          object: {
            username: this.username,
            room: this.roomId,
            message,
            uuid: "",
            client_generated_uuid,
            created_at: new Date(),
          },
        },
        {
          id: true,
        },
      ],
    });
  }

  destroy() {
    try {
      this.subscription?.ws.close();
    } catch (e) {
      console.log(`Error while updating subscription`);
    }
  }
}
