import type { SECURE_SVM_EVENTS } from "./VMs/svm/events";
import { SVMService } from "./VMs/svm/service";
import type { ISecureEvent, Transport } from "./types";

export default function startSecureService(transport: Transport<ISecureEvent>) {
  new SVMService(transport as Transport<SECURE_SVM_EVENTS>);
}
