import type { BarterOffers } from "@coral-xyz/common";
import { EXECUTE_BARTER, UPDATE_ACTIVE_BARTER } from "@coral-xyz/common";

import { Redis } from "../Redis";

export const updateBarter = (
  barterId: number,
  { user1, user2 }: { user1: string; user2: string },
  userId: string,
  updatedParams: BarterOffers
) => {
  Redis.getInstance().publish(`INDIVIDUAL_${user1}`, {
    type: UPDATE_ACTIVE_BARTER,
    payload: {
      barterId,
      [user1 === userId ? "localOffers" : "remoteOffers"]: updatedParams,
    },
  });
  Redis.getInstance().publish(`INDIVIDUAL_${user2}`, {
    type: UPDATE_ACTIVE_BARTER,
    payload: {
      barterId,
      [user2 === userId ? "localOffers" : "remoteOffers"]: updatedParams,
    },
  });
};

export const executeBarterRealtime = (
  barterId: number,
  { user1, user2 }: { user1: string; user2: string }
) => {
  Redis.getInstance().publish(`INDIVIDUAL_${user1}`, {
    type: EXECUTE_BARTER,
    payload: {
      barterId,
    },
  });
  Redis.getInstance().publish(`INDIVIDUAL_${user2}`, {
    type: EXECUTE_BARTER,
    payload: {
      barterId,
    },
  });
};
