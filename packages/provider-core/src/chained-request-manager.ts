// A request manager that is used for chaining requests form
// child IFRAMES to parent IFRAMES.

import type {
  Event,
  ResponseHandler,
  RpcRequest,
  RpcResponse,
} from "@coral-xyz/common";
import { getLogger } from "@coral-xyz/common";

import { isValidEventOrigin } from ".";

const logger = getLogger("common/request-manager");

export class ChainedRequestManager {
  private _responseResolvers: { [requestId: number]: ResponseHandler } = {};
  private _requestId = 0;
  private _requestChannel: string;
  private _responseChannel: string;
  private _url: string;
  private _childIframes: {
    element: HTMLIFrameElement;
    id: string;
    url: string;
  }[] = [];

  constructor(requestChannel: string, responseChannel: string) {
    this._requestChannel = requestChannel;
    this._responseChannel = responseChannel;
    this._requestId = 0;
    this._responseResolvers = {};
    this._url = window.location.href;
    this._childIframes = [];
    this._initChannels();
  }

  public _initChannels() {
    window.addEventListener(
      "message",
      this._handleRpcChildRequestAndParentResponse.bind(this)
    );
  }

  private _handleRpcChildRequestAndParentResponse = (event: Event) => {
    if (!isValidEventOrigin(event)) return;

    this._handleRpcParentResponse(event);
    this._handleRpcChildRequest(event);
  };

  private _handleRpcChildRequest = (event: Event) => {
    this._childIframes.forEach(({ url: iframeUrl }) => {
      const url = new URL(iframeUrl);
      if (
        // TODO: hardcode allowed origin(s)
        event.origin !== url.origin ||
        event.data.href !== url.href ||
        event.data.type !== this._requestChannel
      ) {
        return;
      }
      window.parent.postMessage(
        {
          type: this._requestChannel,
          href: this._url,
          iframeIdentifiers: window.name
            ? [...(event.data.iframeIdentifiers || []), window.name]
            : event.data.iframeIdentifiers || [],
          detail: {
            id: event.data.detail.id,
            method: event.data.detail.method,
            params: event.data.detail.params,
          },
        },
        "*"
      );
    });
  };

  private _handleRpcParentResponse = (event: Event) => {
    if (event.data.type !== this._responseChannel) return;
    if (
      event.data.iframeIdentifiers &&
      event.data.iframeIdentifiers.length >= 1
    ) {
      // need to propagate this event back to a child iframe, it doesn't
      // belong to this iframe
      const iframeIdentifiers = event.data.iframeIdentifiers;
      const childIframeIdentifier = iframeIdentifiers.pop();
      this._childIframes.forEach(({ id, element }) => {
        if (childIframeIdentifier === id) {
          const msg = {
            type: this._responseChannel,
            detail: event.data.detail,
            iframeIdentifiers: iframeIdentifiers,
          };
          element.contentWindow?.postMessage(msg, "*");
        }
      });
      return;
    }
    const { id, result, error } = event.data.detail;
    const resolver = this._responseResolvers[id];
    if (!resolver) {
      logger.error("unexpected event", event);
      throw new Error("unexpected event");
    }
    delete this._responseResolvers[id];
    const [resolve, reject] = resolver;
    if (error) {
      reject(new Error(error));
    } else {
      resolve(result);
    }
  };

  // Sends a request from this script to the content script across the
  // window.postMessage channel.
  public async request<T = any>({
    method,
    params,
  }: RpcRequest): Promise<RpcResponse<T>> {
    const id = this._requestId;
    this._requestId += 1;

    const [prom, resolve, reject] = this._addResponseResolver(id);
    window.parent.postMessage(
      {
        type: this._requestChannel,
        // this._url will always be set here, because this._parent is true.
        href: this._url!,
        iframeIdentifiers: window.name ? [window.name] : [],
        detail: {
          id,
          method,
          params,
        },
      },
      "*"
    );
    return await prom;
  }

  addChildIframe(iframe) {
    this._childIframes.push(iframe);
  }

  removeChildIframe(id) {
    this._childIframes = this._childIframes.filter((x) => x.id !== id);
  }

  // This must be called before `window.dispatchEvent`.
  private _addResponseResolver(requestId: number) {
    let resolve, reject;
    const prom = new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
    this._responseResolvers[requestId] = [resolve, reject];
    return [prom, resolve, reject];
  }
}
