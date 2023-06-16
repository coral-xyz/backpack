import { UserClient } from "@coral-xyz/secure-background/clients";
import type { SecureEvent } from "@coral-xyz/secure-background/types";
import { selector } from "recoil";

import { secureBackgroundSenderAtom } from "./transportAtoms";

export const userAtom = selector<
  SecureEvent<"SECURE_USER_GET">["response"] | null
>({
  key: "userAtom",
  get: async ({ get }) => {
    const sender = get(secureBackgroundSenderAtom);
    const userClient = new UserClient(sender, {
      context: "extension",
      address: "secureUI",
      name: "Secure UI",
    });
    const response = await userClient.getUser({});
    if (response.error) {
      console.error(response.error);
      return null;
    }
    return response.response!;
  },
});
