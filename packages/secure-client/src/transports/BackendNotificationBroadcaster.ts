import { BACKEND_EVENT } from "@coral-xyz/common";
import type { TransportBroadcaster } from "@coral-xyz/secure-background/types";
import type EventEmitter from "eventemitter3";

export class BackendNotificationBroadcaster implements TransportBroadcaster {
  constructor(
    private emitter: EventEmitter,
    private eventName: string = BACKEND_EVENT
  ) {}

  broadcast = (request: { name: string; data: any }): Promise<any> => {
    this.emitter.emit(this.eventName, request);
    return Promise.resolve(null) as any;
  };
}
