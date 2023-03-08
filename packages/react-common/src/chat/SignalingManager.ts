import type {
  BarterOffers,
  EnrichedMessage,
  MessageWithMetadata,
  SubscriptionType,
  ToServer,
} from "@coral-xyz/common";
import {
  CHAT_MESSAGES,
  DELETE_MESSAGE,
  EXECUTE_BARTER,
  NOTIFICATION_ADD,
  SUBSCRIBE,
  UPDATE_ACTIVE_BARTER,
  WS_READY,
} from "@coral-xyz/common";
import {
  bulkAddChats,
  createDefaultFriendship,
  createOrUpdateCollection,
  deleteChat,
  getFriendshipByRoom,
  updateFriendship,
  updateLastRead,
} from "@coral-xyz/db";

import { getSanitizedTitle } from "./getSanitizedTitle";
import { RECONNECTING, Signaling } from "./Signaling";

const DEBOUNCE_INTERVAL_MS = 500;

export class SignalingManager {
  private static instance: SignalingManager;
  private signaling?: Signaling;
  private uuid = "";
  updateLastReadTimeout: { [room: string]: number };
  public onUpdateRecoil = (
    props:
      | {
          type: "friendship";
        }
      | { type: "collection" }
      | {
          type: "chat";
          payload: {
            uuid: string;
            room: string;
            type: SubscriptionType;
            chats: EnrichedMessage[];
            clear?: boolean;
          };
        }
      | {
          type: "add-notifications";
          payload: {
            id: number;
            title: string;
            body: string;
            xnft_id: string;
            timestamp: string;
            uuid: string;
          };
        }
  ) => {};
  private postSubscribes: Set<{
    room: string;
    type: SubscriptionType;
    mint: string;
    publicKey: string;
  }> = new Set<{
    room: string;
    type: SubscriptionType;
    mint: string;
    publicKey: string;
  }>();

  private constructor() {}

  public onBarterUpdate(updatedParams: {
    barterId: number;
    localOffers?: BarterOffers;
    remoteOffers?: BarterOffers;
  }) {}

  public onBarterExecute(props: { barterId: number }) {}

  updateUuid(uuid: string, jwt: string) {
    this.signaling?.destroy();
    this.signaling = new Signaling(uuid, jwt);
    this.uuid = uuid;
    this.initHandlers();
    this.updateLastReadTimeout = {};
  }

  initHandlers() {
    this.signaling?.on(
      CHAT_MESSAGES,
      async (payload: { messages: MessageWithMetadata[] }) => {
        if (payload.messages && payload.messages[0]) {
          // we only bulkify messages from the same room yet
          this.onUpdateRecoil({
            type: "chat",
            payload: {
              room: payload.messages[0].room,
              type: payload.messages[0].type,
              uuid: this.uuid,
              chats: payload.messages.map((chat) => ({
                ...chat,
                direction: this.uuid === chat.uuid ? "send" : "recv",
                received: true,
                from_http_server: 0,
              })),
            },
          });
        }
        await bulkAddChats(
          this.uuid,
          payload.messages.map((chat) => ({
            ...chat,
            direction: this.uuid === chat.uuid ? "send" : "recv",
            received: true,
            from_http_server: 0,
          }))
        );
        for (const message of payload.messages) {
          if (message.type === "individual") {
            const friendship = await getFriendshipByRoom(
              this.uuid,
              parseInt(message.room)
            );
            if (friendship?.remoteUserId) {
              await updateFriendship(this.uuid, friendship?.remoteUserId, {
                last_message_sender: message.uuid,
                last_message: getSanitizedTitle(message),
                last_message_timestamp: new Date().toISOString(),
                unread: message.uuid === this.uuid ? 0 : 1,
                remoteInteracted: 1,
              });
              this.onUpdateRecoil({
                type: "friendship",
              });
            } else {
              if (message.uuid !== this.uuid) {
                await createDefaultFriendship(
                  this.uuid,
                  message.uuid,
                  {
                    last_message_sender: message.uuid,
                    last_message_timestamp: new Date().toISOString(),
                    last_message: getSanitizedTitle(message),
                    last_message_client_uuid: message.uuid,
                  },
                  {
                    remoteInteracted: 1,
                  }
                );
              }

              this.onUpdateRecoil({
                type: "friendship",
              });
            }
          } else {
            // group chat
            await createOrUpdateCollection(this.uuid, {
              collectionId: message.room,
              lastMessage: message.message,
              lastMessageUuid: message.client_generated_uuid,
              lastMessageTimestamp: new Date().toISOString(),
            });
            this.onUpdateRecoil({
              type: "collection",
            });
          }
        }
      }
    );

    this.signaling?.on(NOTIFICATION_ADD, (payload) => {
      this.onUpdateRecoil({
        type: "add-notifications",
        payload,
      });
    });

    this.signaling?.on(UPDATE_ACTIVE_BARTER, (payload) => {
      this.onBarterUpdate(payload);
    });

    this.signaling?.on(EXECUTE_BARTER, (payload) => {
      this.onBarterExecute(payload);
    });

    this.signaling?.on(
      DELETE_MESSAGE,
      async (payload: {
        client_generated_uuid: string;
        room: string;
        type: SubscriptionType;
      }) => {
        const updatedChat = await deleteChat(
          this.uuid,
          payload.client_generated_uuid
        );
        if (updatedChat) {
          this.onUpdateRecoil({
            type: "chat",
            payload: {
              room: payload.room,
              type: payload.type,
              uuid: this.uuid,
              chats: [updatedChat],
            },
          });
        }
      }
    );

    this.signaling?.on(WS_READY, () => {
      this.postSubscribes.forEach(({ room, type, mint, publicKey }) => {
        this.send({
          type: SUBSCRIBE,
          payload: {
            room,
            type,
            mint,
            publicKey,
          },
        });
      });
    });

    this.signaling?.on(RECONNECTING, () => {});
  }

  debouncedUpdateLastRead(
    latestMessage: EnrichedMessage,
    publicKey?: string,
    mint?: string
  ) {
    if (latestMessage) {
      if (this.updateLastReadTimeout[latestMessage.room]) {
        window.clearTimeout(this.updateLastReadTimeout[latestMessage.room]);
      }
      this.updateLastReadTimeout[latestMessage.room] = window.setTimeout(
        async () => {
          await updateLastRead(
            this.uuid,
            latestMessage.client_generated_uuid,
            latestMessage.room,
            latestMessage.type,
            latestMessage.uuid,
            publicKey,
            mint
          );
          if (latestMessage.type === "collection") {
            this.onUpdateRecoil({
              type: "collection",
            });
          } else {
            this.onUpdateRecoil({
              type: "friendship",
            });
          }
        },
        DEBOUNCE_INTERVAL_MS
      );
    }
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new SignalingManager();
    }
    return this.instance;
  }

  async send(message: ToServer) {
    this.signaling?.send(message);
    if (message.type === CHAT_MESSAGES) {
      // we only bulkify messages from the same room yet
      this.onUpdateRecoil({
        type: "chat",
        payload: {
          room: message.payload.room,
          type: message.payload.type,
          uuid: this.uuid,
          chats: message.payload.messages.map((m) => ({
            ...m,
            direction: "send",
            from_http_server: 0,
            created_at: new Date().getTime().toString(),
            uuid: this.uuid,
            room: message.payload.room,
            type: message.payload.type,
          })),
        },
      });
      bulkAddChats(
        this.uuid,
        message.payload.messages.map((m) => ({
          ...m,
          direction: "send",
          from_http_server: 0,
          created_at: new Date().getTime().toString(),
          uuid: this.uuid,
          room: message.payload.room,
          type: message.payload.type,
        }))
      );
      message.payload.messages.forEach(async (m) => {
        if (message.payload.type === "individual") {
          const friendship = await getFriendshipByRoom(
            this.uuid,
            parseInt(message.payload.room)
          );
          if (friendship?.remoteUserId) {
            await updateFriendship(this.uuid, friendship?.remoteUserId, {
              last_message_sender: this.uuid,
              last_message: getSanitizedTitle(m),
              last_message_timestamp: new Date().toISOString(),
              unread: 0,
            });
            this.onUpdateRecoil({
              type: "friendship",
            });
          }
        } else {
          createOrUpdateCollection(this.uuid, {
            collectionId: message.payload.room,
            lastReadMessage: m.client_generated_uuid,
            lastMessageUuid: m.client_generated_uuid,
            lastMessage: getSanitizedTitle(m),
            lastMessageTimestamp: new Date().toISOString(),
          });
        }
      });
    }
    if (message.type === SUBSCRIBE) {
      this.postSubscribes.add({
        room: message.payload.room,
        type: message.payload.type,
        mint: message.payload.mint || "",
        publicKey: message.payload.publicKey || "",
      });
    }
    if (message.type === DELETE_MESSAGE) {
      const updatedChat = await deleteChat(
        this.uuid,
        message.payload.client_generated_uuid
      );

      if (updatedChat) {
        this.onUpdateRecoil({
          type: "chat",
          payload: {
            room: message.payload.room,
            type: message.payload.type,
            uuid: this.uuid,
            chats: [updatedChat],
          },
        });
      }
    }
  }
}
