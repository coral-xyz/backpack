import { Chain } from "./zeus/index";

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
  constructor(roomId: string, onMessages: (messages: Message[]) => void) {
    this.roomId = roomId;
    this.subscribeIncomingMessages();
  }

  subscribeIncomingMessages() {}
}
