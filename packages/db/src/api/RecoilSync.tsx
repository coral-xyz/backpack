import type { SubscriptionType } from "@coral-xyz/common";

import { getDb } from "../db";

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
    for (let i = 0; i < newUsersMetadata?.length; i++) {
      await this.storeImageInLocalStorage(newUsersMetadata[i]?.image);
    }
  }

  async storeImageInLocalStorage(url: string) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      //@ts-ignore
      const context = canvas.getContext("2d");
      const base_image = new Image();
      base_image.src = url;
      base_image.onload = function () {
        const aspectRatio = base_image.width / base_image.height;
        canvas.width = 400;
        canvas.height = 400 / aspectRatio;
        //@ts-ignore
        context.clearRect(0, 0, canvas.width, canvas.height);
        //@ts-ignore
        context.drawImage(base_image, 0, 0, canvas.width, canvas.height);
        // @ts-ignore
        const dataURL = canvas.toDataURL("image/webp");
        localStorage.setItem(`img-${url}`, dataURL);
        resolve("");
      };
    });
  }

  getChatsForRoom(uuid: string, room: string, type: SubscriptionType) {
    return getDb(uuid).messages.where({ room, type }).sortBy("created_at");
  }

  getAllUserMetadata(uuid: string) {
    return getDb(uuid).users.toArray();
  }
}
