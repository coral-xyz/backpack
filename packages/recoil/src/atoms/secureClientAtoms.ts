import type { TransportSender } from "@coral-xyz/secure-client";
import { atom } from "recoil";

export const secureBackgroundSenderAtom = atom<TransportSender>({
  key: "secureBackgroundSenderAtom",
});
