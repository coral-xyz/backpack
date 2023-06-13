import type {
  SECURE_EVM_EVENTS,
  SECURE_EVM_SIGN_MESSAGE,
  SECURE_EVM_SIGN_TX,
} from "../services/evm/events";
import type {
  SECURE_UI_APPROVE_SIGN_MESSAGE,
  SECURE_UI_EVENTS,
} from "../services/secureUI/events";
import type {
  SECURE_SVM_EVENTS,
  SECURE_SVM_SAY_HELLO,
  SECURE_SVM_SIGN_ALL_TX,
  SECURE_SVM_SIGN_MESSAGE,
  SECURE_SVM_SIGN_TX,
} from "../services/svm/events";
import type {
  SECURE_USER_EVENTS,
  SECURE_USER_UNLOCK_KEYRING,
} from "../services/user/events";

export * from "../services/evm/events";
export * from "../services/secureUI/events";
export * from "../services/svm/events";
export * from "../services/user/events";

export type SECURE_EVENTS =
  | SECURE_SVM_EVENTS
  | SECURE_EVM_EVENTS
  | SECURE_USER_EVENTS
  | SECURE_UI_EVENTS;

export type SecureEvent<T extends SECURE_EVENTS = SECURE_EVENTS> =
  // SVM
  T extends "SECURE_SVM_SIGN_MESSAGE"
    ? SECURE_SVM_SIGN_MESSAGE
    : T extends "SECURE_SVM_SIGN_TX"
    ? SECURE_SVM_SIGN_TX
    : T extends "SECURE_SVM_SIGN_ALL_TX"
    ? SECURE_SVM_SIGN_ALL_TX
    : T extends "SECURE_SVM_SAY_HELLO"
    ? SECURE_SVM_SAY_HELLO
    : // EVM
    T extends "SECURE_EVM_SIGN_MESSAGE"
    ? SECURE_EVM_SIGN_MESSAGE
    : T extends "SECURE_EVM_SIGN_TX"
    ? SECURE_EVM_SIGN_TX
    : // Secure UI
    T extends "SECURE_UI_APPROVE_SIGN_MESSAGE"
    ? SECURE_UI_APPROVE_SIGN_MESSAGE
    : // User
    T extends "SECURE_USER_UNLOCK_KEYRING"
    ? SECURE_USER_UNLOCK_KEYRING
    : never;
