import type { SubscriptionType } from "@coral-xyz/common";

import { getDb } from "../db";

import { LocalImageManager } from "./LocalImageManager";
import { refreshUsers } from "./users";

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

  async refreshUsersMetadata(uuid: string) {
    const users = await getDb(uuid).users.toArray();
    const newUsersMetadata = await refreshUsers(
      uuid,
      users.map((x) => x.uuid),
      true
    );

    if (!newUsersMetadata) return;

    const sortedUsersMetadata = newUsersMetadata?.sort((a) => {
      if (localStorage.getItem(`image-${a.image}`)) {
        return 1;
      }
      return -1;
    });

    if (sortedUsersMetadata) {
      LocalImageManager.getInstance().bulkAddToQueue(
        sortedUsersMetadata.map((x) => {
          return {
            image: x.image,
          };
        })
      );
    }
  }

  async sleep(timer) {
    await new Promise((resolve) => setTimeout(resolve, timer * 1000));
  }

  getChatsForRoom(uuid: string, room: string, type: SubscriptionType) {
    return getDb(uuid).messages.where({ room, type }).sortBy("created_at");
  }

  getAllUserMetadata(uuid: string) {
    return getDb(uuid).users.toArray();
  }
}
