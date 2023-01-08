import { useEffect } from "react";
import { refreshFriendships, SignalingManager } from "@coral-xyz/db";
import { useUser } from "@coral-xyz/recoil";

import { NavTabs } from "../common/Layout/NavTabs";

export function Unlocked() {
  return <NavTabs />;
}
