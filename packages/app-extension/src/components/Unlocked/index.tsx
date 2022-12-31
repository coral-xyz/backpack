import { useEffect } from "react";
import { refreshFriendships } from "@coral-xyz/db";
import { useUser } from "@coral-xyz/recoil";

import { NavTabs } from "../common/Layout/NavTabs";

export function Unlocked() {
  const { uuid } = useUser();

  useEffect(() => {
    refreshFriendships(uuid);
  }, [uuid]);

  return <NavTabs />;
}
