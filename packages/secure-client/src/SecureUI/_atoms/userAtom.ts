import { UserClient } from "@coral-xyz/secure-background/clients";
import type { SecureResponse } from "@coral-xyz/secure-background/types";
import { atom, selector } from "recoil";

import { secureBackgroundSenderAtom } from "./clientAtoms";

export const userUpdatedAtom = atom<number>({
  key: "userUpdatedAtom",
  default: 0,
});

export const userAtom = selector<
  SecureResponse<"SECURE_USER_GET">["response"] | null
>({
  key: "userAtom",
  get: async ({ get }) => {
    get(userUpdatedAtom);
    const secureBackgroundSender = get(secureBackgroundSenderAtom);
    const userClient = new UserClient(secureBackgroundSender);

    const response = await userClient.getUser({});
    if (response.error) {
      console.error(response.error);
      return null;
    }
    return response.response ?? null;
  },
});
