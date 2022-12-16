import {
  MESSAGING_COMMUNICATION_FETCH,
  MESSAGING_COMMUNICATION_FETCH_RESPONSE,
  MESSAGING_COMMUNICATION_PUSH,
} from "@coral-xyz/common";

export class ParentCommunicationManager {
  private static instance: ParentCommunicationManager;
  private counter = 0;
  private parentUrl?: string;
  private pendingResponses: {
    [counter: number]: { resolve: any; reject: any };
  };

  private constructor() {
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
    this.pendingResponses = {};
  }

  public setParentUrl(parentUrl: string) {
    console.error("set parent url");
    console.error(parentUrl);
    this.parentUrl = parentUrl;
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new ParentCommunicationManager();
    }
    return this.instance;
  }

  fetch(url: string, args?: any): Promise<{ json: () => any }> {
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
  }

  push(props: { title: string; componentId: string; componentProps: any }) {
    window.parent.postMessage(
      {
        type: MESSAGING_COMMUNICATION_PUSH,
        payload: props,
      },
      "*"
    );
  }
}
