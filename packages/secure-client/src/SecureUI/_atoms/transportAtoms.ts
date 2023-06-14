import type {
  SECURE_EVENTS,
  TransportReceiver,
  TransportSender,
} from "@coral-xyz/secure-background/types";
import { atom } from "recoil";

export const secureBackgroundSenderAtom = atom<TransportSender>({
  key: "secureBackgroundSenderAtom",
  // this prevents recoil from freezing the object in dev mode
  // required to keep the transport working.
  dangerouslyAllowMutability: true,
});

export const secureUIReceiverAtom = atom<
  TransportReceiver<SECURE_EVENTS, "confirmation">
>({
  key: "secureUIReceiverAtom",
  // this prevents recoil from freezing the object in dev mode
  // required to keep the transport working.
  dangerouslyAllowMutability: true,
});
