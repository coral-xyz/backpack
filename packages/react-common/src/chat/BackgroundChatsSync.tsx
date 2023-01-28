import { latestReceivedMessage, RecoilSync } from "@coral-xyz/db";

import { refreshChatsFor } from "./refreshChatsFor";

export class BackgroundChatsSync {
  private static instance: BackgroundChatsSync;
  private constructor() {}

  static getInstance() {
    if (!this.instance) {
      this.instance = new BackgroundChatsSync();
    }
    return this.instance;
  }

  async updateUuid(uuid: string) {
    const activeChats = await RecoilSync.getInstance().getActiveChats(uuid);
    const activeGroups = await RecoilSync.getInstance().getActiveGroups(uuid);
    activeChats.forEach(async (activeChat) => {
      const lastMessage = await latestReceivedMessage(
        uuid,
        activeChat.friendshipId.toString(),
        "individual"
      );
      if (
        activeChat.last_message_client_uuid !==
        lastMessage?.client_generated_uuid
      ) {
        refreshChatsFor(uuid, activeChat.friendshipId.toString(), "individual");
      }
    });
    activeGroups.forEach(async (activeChat) => {
      const lastMessage = await latestReceivedMessage(
        uuid,
        activeChat.collectionId,
        "collection"
      );
      if (activeChat.lastMessageUuid !== lastMessage?.client_generated_uuid) {
        refreshChatsFor(uuid, activeChat.collectionId, "collection", "", "");
      }
    });
  }
}
