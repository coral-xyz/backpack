import {
  MESSAGING_COMMUNICATION_FETCH,
  MESSAGING_COMMUNICATION_FETCH_RESPONSE,
  MESSAGING_COMMUNICATION_PUSH,
} from "@coral-xyz/common";

import { IFRAME_HOSTED } from "./config";

export class ParentCommunicationManager {
  private static instance: ParentCommunicationManager;
  private counter = 0;
  private parentUrl?: string;
  private pendingResponses: {
    [counter: number]: { resolve: any; reject: any };
  };
  private nativePush?: (props: any) => {};
  private nativePop?: () => {};

  private constructor() {
    if (IFRAME_HOSTED) {
      window.addEventListener(
        "message",
        (event) => {
          if (event.origin !== this.parentUrl) {
            return;
          }
          if (event.data.type === MESSAGING_COMMUNICATION_FETCH_RESPONSE) {
            console.log("response got");
            console.log(event.data);
            if (event.data.payload.success) {
              this.pendingResponses[event.data.payload.counter]?.resolve({
                json: () => event.data.payload.data,
              });
            } else {
              this.pendingResponses[event.data.payload.counter]?.reject();
            }
          }
        },
        false
      );
    }
    this.pendingResponses = {};
  }

  public setParentUrl(parentUrl: string) {
    this.parentUrl = parentUrl;
  }

  public setNativePush(push: any) {
    this.nativePush = push;
  }

  public setNativePop(pop: any) {
    this.nativePop = pop;
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new ParentCommunicationManager();
    }
    return this.instance;
  }

  fetch(url: string, args?: any): Promise<{ json: () => any }> {
    if (IFRAME_HOSTED) {
      return new Promise((resolve, reject) => {
        const counter = this.counter++;
        window.parent.postMessage(
          {
            type: MESSAGING_COMMUNICATION_FETCH,
            payload: {
              url,
              args,
              counter,
            },
          },
          "*"
        );
        this.pendingResponses[counter] = { resolve, reject };
      });
    } else {
      return fetch(url, args);
    }
  }

  pop() {
    this.nativePop?.();
  }

  push(props: {
    title: string;
    componentId: string;
    componentProps: any;
    pushAboveRoot?: boolean;
  }) {
    if (IFRAME_HOSTED) {
      window.parent.postMessage(
        {
          type: MESSAGING_COMMUNICATION_PUSH,
          payload: props,
        },
        "*"
      );
    } else {
      this.nativePush?.(props);
    }
  }
}
