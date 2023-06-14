import type { TransportSender } from "@coral-xyz/secure-background/types";
import { atom } from "recoil";

export const secureBackgroundSenderAtom = atom<TransportSender>({
  key: "secureBackgroundSenderAtom",
  // this prevents recoil from freezing the object in dev mode
  // required to keep the transport working.
  dangerouslyAllowMutability: true,
});
