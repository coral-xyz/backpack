import { Subscription } from "./subscriptionManager";
import { Chain, SubscriptionToGraphQL } from "./zeus/index";
import { HASURA_URL, HASURA_WS_URL, JWT } from "./config";

interface Message {
  id: number;
  username?: string;
  uuid?: string;
  message?: string;
}

export class ChatManager {
  private roomId: string;
  private username: string = "kira";
  private onMessages: (messages: Message[]) => void;
  private subscription?: SubscriptionToGraphQL<any, any, any>;

  constructor(roomId: string, onMessages: (messages: Message[]) => void) {
    this.roomId = roomId;
    this.onMessages = onMessages;
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
        },
      ],
    });

    subscription.on(({ chats }) => {
      this.onMessages(chats);
    });

    this.subscription = subscription;
  }

  async send(message: string) {
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
          },
        },
        {
          id: true,
        },
      ],
    });
  }

  destroy() {
    this.subscription?.ws.close();
  }
}
