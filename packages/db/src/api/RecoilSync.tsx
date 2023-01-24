import type { SubscriptionType } from "@coral-xyz/common";

import { getDb } from "../db";

export class RecoilSync {
  private static instance: RecoilSync;
  private constructor() {}

  static getInstance() {
    if (!this.instance) {
      this.instance = new RecoilSync();
    }
    return this.instance;
  }

  getActiveChats(uuid: string) {
    return getDb(uuid)
      .inbox.where({ blocked: 0 })
      .filter(
        (x) =>
          x.interacted === 1 || (x.areFriends === 1 && x.remoteInteracted === 1)
      )
      .reverse()
      .sortBy("last_message_timestamp");
  }

  getActiveGroups(uuid: string) {
    return getDb(uuid).collections.toArray();
  }

  getRequestCount(uuid: string) {
    return getDb(uuid)
      .inbox.where({ areFriends: 0, interacted: 0, remoteInteracted: 1 })
      .count();
  }

  getAllChats(uuid: string) {
    return getDb(uuid).messages.toArray();
  }

  getChatsForRoom(uuid: string, room: string, type: SubscriptionType) {
    return getDb(uuid).messages.where({ room, type }).sortBy("created_at");
  }

  getAllUserMetadata(uuid: string) {
    return getDb(uuid).users.toArray();
  }
}
