import type { SubscriptionType, UserMetadata } from "@coral-xyz/common";

import { getDb } from "../db";
import { bulkGetImages } from "../db/images";

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

  async getActiveChats(uuid: string) {
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

  getAllUsers(uuid: string): Promise<UserMetadata[]> {
    return getDb(uuid).users.toArray();
  }

  async refreshUsersMetadata(uuid: string) {
    const users = await getDb(uuid).users.toArray();
    const newUsersMetadata = await refreshUsers(
      uuid,
      users.map((x) => x.uuid),
      true
    );

    const allImageData = await bulkGetImages("images");

    const sortedUsersMetadata = newUsersMetadata?.sort((a) => {
      if (allImageData.includes(`image-${a.image}`)) {
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
