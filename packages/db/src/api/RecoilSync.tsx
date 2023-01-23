import { useLiveQuery } from "dexie-react-hooks";

import { getDb } from "../db";

import { refreshFriendships } from "./friendships";

export class RecoilSync {
  private static instance: RecoilSync;
  private constructor() {}

  static getInstance() {
    if (!this.instance) {
      this.instance = new RecoilSync();
    }
    return this.instance;
  }

  async init(uuid: string) {
    await this.initFriendships(uuid);
  }

  async initFriendships(uuid: string) {
    await refreshFriendships(uuid);
    await this.initGroups(uuid);
  }

  async initGroups(uuid: string) {}

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
}
