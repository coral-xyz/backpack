import type { ISecureEvent } from "../../types";

export type SECURE_SVM_EVENTS = SECURE_SVM_SIGN_MESSAGE | SECURE_SVM_SIGN;

export interface SECURE_SVM_SIGN_MESSAGE extends ISecureEvent {
  name: "SECURE_SVM_SIGN_MESSAGE";
  params: {
    message: string;
    publicKey: string;
  };
  response: {
    singedMessage: string;
  };
}

export interface SECURE_SVM_SIGN extends ISecureEvent {
  name: "SECURE_SVM_SIGN";
  params: {
    publicKey: string;
    tx: string;
  };
}
