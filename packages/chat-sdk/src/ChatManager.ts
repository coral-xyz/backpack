import { Chain } from "./zeus/index";
import { HASURA_URL, JWT } from "./config";

const chain = Chain(HASURA_URL, {
  headers: {
    Authorization: `Bearer ${JWT}`,
  },
});

interface Message {
  username: string;
  uuid: string;
  message: string;
}

export class ChatManager {
  private roomId: string;
  private username: string = "kira";

  constructor(roomId: string, onMessages: (messages: Message[]) => void) {
    this.roomId = roomId;
    this.subscribeIncomingMessages();
  }

  async subscribeIncomingMessages() {
    const res = await chain("subscription")({
      chats: [
        {
          where: {
            room: { _eq: this.roomId },
            username: { _neq: this.username },
          },
          limit: 50,
        },
        {
          username: true,
          message: true,
        },
      ],
    });
    console.log(res);
  }

  async send(message: string) {
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
