import type {
  Event,
  ResponseHandler,
  RpcRequest,
  RpcResponse,
} from "@coral-xyz/common";
import { getLogger } from "@coral-xyz/common";

import { isValidEventOrigin } from ".";

const logger = getLogger("common/request-manager");

export class RequestManager {
  private _responseResolvers: { [requestId: number]: ResponseHandler } = {};
  private _requestId = 0;
  private _requestChannel: string;
  private _responseChannel: string;
  private _parent?: boolean;
  private _url?: string;

  constructor(
    requestChannel: string,
    responseChannel: string,
    parent?: boolean
  ) {
    this._requestChannel = requestChannel;
    this._responseChannel = responseChannel;
    this._requestId = 0;
    this._responseResolvers = {};
    this._parent = parent;
    if (parent) {
      this._url = window.location.href;
    }
    this._initChannels();
  }

  public _initChannels() {
    window.addEventListener("message", this._handleRpcResponse.bind(this));
  }

  private _handleRpcResponse(event: Event) {
    if (!isValidEventOrigin(event)) return;
    if (event.data.type !== this._responseChannel) return;

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
  }

  // Sends a request from this script to the content script across the
  // window.postMessage channel.
  public async request<T = any>({
    method,
    params,
  }: RpcRequest): Promise<RpcResponse<T>> {
    const id = this._requestId;
    this._requestId += 1;

    const [prom, resolve, reject] = this._addResponseResolver(id);
    if (this._parent) {
      window.parent.postMessage(
        {
          type: this._requestChannel,
          // this._url will always be set here, because this._parent is true.
          href: this._url!,
          detail: {
            id,
            method,
            params,
          },
        },
        "*"
      );
    } else {
      window.postMessage(
        { type: this._requestChannel, detail: { id, method, params } },
        "*"
      );
    }
    return await prom;
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
