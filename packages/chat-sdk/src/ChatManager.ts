import { Chain, Subscription } from "./zeus/index";
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

  constructor(roomId: string, onMessages: (messages: Message[]) => void) {
    this.roomId = roomId;
    this.onMessages = onMessages;
    this.subscribeIncomingMessages();
  }

  async subscribeIncomingMessages() {
    const wsChain = Subscription(HASURA_WS_URL, {
      headers: {
        Authorization: `Bearer ${JWT}`,
      },
    });

    wsChain("subscription")({
      chats: [
        {},
        {
          id: true,
          username: true,
          uuid: true,
          message: true,
        },
      ],
    }).on(({ chats }) => {
      this.onMessages(chats);
    });
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
}
