import { Signaling, SIGNALING_CONNECTED } from "./Signaling";
import {
  BACKEND_API_URL,
  CHAT_MESSAGES,
  Message,
  MessageWithMetadata,
  SUBSCRIBE,
  SubscriptionType,
} from "@coral-xyz/common";

export interface EnrichedMessage extends MessageWithMetadata {
  direction: "send" | "recv";
  received?: boolean;
}

export class ChatManager {
  private roomId: string;
  private userId: string;
  private onMessages: (messages: Message[]) => void;
  private onMessagesPrepend: (messages: Message[]) => void;
  private onLocalMessageReceived: (messages: Message[]) => void;
  private lastChatId = 1000000000;
  private sendQueue: { [client_generated_uuid: string]: boolean } = {};
  private fetchingInProgress = false;
  private signaling: Signaling;

  constructor(
    userId: string,
    roomId: string,
    onMessages: (messages: EnrichedMessage[]) => void,
    onMessagesPrepend: (messages: EnrichedMessage[]) => void,
    onLocalMessageReceived: (messages: EnrichedMessage[]) => void
  ) {
    this.roomId = roomId;
    this.userId = userId;
    this.onMessages = onMessages;
    this.onMessagesPrepend = onMessagesPrepend;
    this.onLocalMessageReceived = onLocalMessageReceived;
    this.signaling = new Signaling();
    this.init();
  }

  async fetchMoreChats() {
    if (this.fetchingInProgress) {
      return;
    }

    this.fetchingInProgress = true;
    fetch(
      `${BACKEND_API_URL}/chat?room=${this.roomId}&type=collection&lastChatId=${this.lastChatId}`,
      {
        method: "GET",
      }
    )
      .then(async (response) => {
        const json = await response.json();
        const chats: MessageWithMetadata[] = json.chats;
        if (chats && chats.length !== 0) {
          chats.forEach((chat) => {
            if (chat.id < this.lastChatId) {
              this.lastChatId = chat.id;
            }
          });
          this.onMessagesPrepend(
            chats.map((chat) => ({
              ...chat,
              direction: this.userId === chat.uuid ? "send" : "recv",
            }))
          );
        }
        this.fetchingInProgress = false;
      })
      .catch((e) => {
        console.error(`Error while fetching data from chat ${e}`);
        this.fetchingInProgress = false;
      });
  }

  async init() {
    this.signaling.addListener(SIGNALING_CONNECTED, () => {
      this.signaling.send({
        type: SUBSCRIBE,
        payload: {
          type: "collection",
          room: this.roomId,
        },
      });
    });
    this.signaling.addListener(
      CHAT_MESSAGES,
      ({
        messages,
        type,
        room,
      }: {
        messages: MessageWithMetadata[];
        type: SubscriptionType;
        room: string;
      }) => {
        const filteredChats: EnrichedMessage[] = [];
        const filteredReceived: EnrichedMessage[] = [];
        for (let i = 0; i < messages.length; i++) {
          if (messages[i].id < this.lastChatId) {
            this.lastChatId = messages[i].id;
          }
          if (this.sendQueue[messages[i].client_generated_uuid || ""]) {
            delete this.sendQueue[messages[i].client_generated_uuid || ""];
            filteredReceived.push({
              ...messages[i],
              direction: this.userId === messages[i].uuid ? "send" : "recv",
            });
          } else {
            filteredChats.push({
              ...messages[i],
              direction: this.userId === messages[i].uuid ? "send" : "recv",
              received: true,
            });
          }
        }
        if (filteredChats.length) {
          this.onMessages(filteredChats);
        }
        if (filteredReceived.length) {
          this.onLocalMessageReceived(filteredReceived);
        }
      }
    );
  }

  async send(
    message: string,
    client_generated_uuid: string,
    messageKind: "text" | "gif"
  ) {
    this.sendQueue[client_generated_uuid] = true;

    this.signaling.send({
      type: CHAT_MESSAGES,
      payload: {
        messages: [
          {
            message,
            client_generated_uuid,
            message_kind: messageKind,
          },
        ],
        type: "collection",
        room: this.roomId,
      },
    });
  }

  destroy() {
    try {
      this.signaling.destroy();
    } catch (e) {
      console.log(`Error while updating subscription`);
    }
  }
}
