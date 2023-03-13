import { refreshFriendships, refreshGroups } from "@coral-xyz/db";

import { SignalingManager } from "./SignalingManager";

export const refreshGroupsAndFriendships = async (uuid: string) => {
  try {
    await Promise.all([refreshFriendships(uuid), refreshGroups(uuid)]);
  } catch (e) {
    console.error("Error while refreshing friendships and groups");
    console.error(e);
  }
  SignalingManager.getInstance().onUpdateRecoil({
    type: "friendship",
  });
  SignalingManager.getInstance().onUpdateRecoil({
    type: "collection",
  });
};
