import type {
  SECURE_EVM_EVENTS,
  SECURE_EVM_SIGN_MESSAGE,
  SECURE_EVM_SIGN_TX,
} from "./services/evm/events";
import type {
  SECURE_SVM_EVENTS,
  SECURE_SVM_SIGN_MESSAGE,
  SECURE_SVM_SIGN_TX,
} from "./services/svm/events";

export type SECURE_EVENTS = SECURE_SVM_EVENTS | SECURE_EVM_EVENTS;

export type SecureEvent<T extends SECURE_EVENTS = SECURE_EVENTS> =
  T extends "SECURE_SVM_SIGN_MESSAGE"
    ? SECURE_SVM_SIGN_MESSAGE
    : T extends "SECURE_SVM_SIGN_TX"
    ? SECURE_SVM_SIGN_TX
    : T extends "SECURE_EVM_SIGN_MESSAGE"
    ? SECURE_EVM_SIGN_MESSAGE
    : T extends "SECURE_EVM_SIGN_TX"
    ? SECURE_EVM_SIGN_TX
    : never;
