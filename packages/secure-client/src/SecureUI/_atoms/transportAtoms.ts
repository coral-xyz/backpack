import type {
  SECURE_EVENTS,
  TransportReceiver,
  TransportSender,
} from "@coral-xyz/secure-background/types";
import { atom } from "recoil";

export const secureBackgroundSenderAtom = atom<TransportSender>({
  key: "secureBackgroundSenderAtom",
});

export const secureUIReceiverAtom = atom<
  TransportReceiver<SECURE_EVENTS, "confirmation">
>({
  key: "secureUIReceiverAtom",
});
