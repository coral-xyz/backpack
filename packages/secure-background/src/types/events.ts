import type {
  SECURE_EVM_EVENTS,
  SECURE_EVM_SIGN_MESSAGE,
  SECURE_EVM_SIGN_TX,
} from "../services/evm/events";
import type {
  LEDGER_EVM_SIGN_MESSAGE,
  LEDGER_EVM_SIGN_TX,
  LEDGER_SVM_SIGN_MESSAGE,
  LEDGER_SVM_SIGN_TX,
  SECURE_LEDGER_EVENTS,
} from "../services/ledger/events";
import type {
  SECURE_SVM_CONNECT,
  SECURE_SVM_DISCONNECT,
  SECURE_SVM_EVENTS,
  SECURE_SVM_SIGN_ALL_TX,
  SECURE_SVM_SIGN_MESSAGE,
  SECURE_SVM_SIGN_TX,
} from "../services/svm/events";
import type {
  SECURE_USER_APPROVE_ORIGIN,
  SECURE_USER_EVENTS,
  SECURE_USER_GET,
  SECURE_USER_REMOVE_ORIGIN,
  SECURE_USER_UNLOCK_KEYRING,
} from "../services/user/events";

export type { SECURE_EVM_EVENTS } from "../services/evm/events";
export type { SECURE_LEDGER_EVENTS } from "../services/ledger/events";
export type { SECURE_SVM_EVENTS } from "../services/svm/events";
export type { SECURE_USER_EVENTS } from "../services/user/events";

export type SECURE_EVENTS =
  | SECURE_EVM_EVENTS
  | SECURE_SVM_EVENTS
  | SECURE_USER_EVENTS
  | SECURE_LEDGER_EVENTS;

export type SecureEvent<T extends SECURE_EVENTS = SECURE_EVENTS> =
  T extends "SECURE_SVM_SIGN_MESSAGE"
    ? SECURE_SVM_SIGN_MESSAGE
    : T extends "SECURE_SVM_SIGN_TX"
    ? SECURE_SVM_SIGN_TX
    : T extends "SECURE_SVM_SIGN_ALL_TX"
    ? SECURE_SVM_SIGN_ALL_TX
    : T extends "SECURE_SVM_CONNECT"
    ? SECURE_SVM_CONNECT
    : T extends "SECURE_SVM_DISCONNECT"
    ? SECURE_SVM_DISCONNECT
    : T extends "SECURE_EVM_SIGN_MESSAGE"
    ? SECURE_EVM_SIGN_MESSAGE
    : T extends "SECURE_EVM_SIGN_TX"
    ? SECURE_EVM_SIGN_TX
    : T extends "SECURE_USER_UNLOCK_KEYRING"
    ? SECURE_USER_UNLOCK_KEYRING
    : T extends "SECURE_USER_APPROVE_ORIGIN"
    ? SECURE_USER_APPROVE_ORIGIN
    : T extends "SECURE_USER_REMOVE_ORIGIN"
    ? SECURE_USER_REMOVE_ORIGIN
    : T extends "SECURE_USER_GET"
    ? SECURE_USER_GET
    : T extends "LEDGER_SVM_SIGN_TX"
    ? LEDGER_SVM_SIGN_TX
    : T extends "LEDGER_EVM_SIGN_TX"
    ? LEDGER_EVM_SIGN_TX
    : T extends "LEDGER_SVM_SIGN_MESSAGE"
    ? LEDGER_SVM_SIGN_MESSAGE
    : T extends "LEDGER_EVM_SIGN_MESSAGE"
    ? LEDGER_EVM_SIGN_MESSAGE
    : never;
