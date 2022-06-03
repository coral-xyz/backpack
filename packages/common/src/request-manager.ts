import { BackgroundClient } from "./channel";
import type { RpcRequest, RpcResponse, Event, ResponseHandler } from "./types";
import { getLogger } from "./logging";

const logger = getLogger("request-manager");

export class RequestManager implements BackgroundClient {
  private _responseResolvers: { [requestId: number]: ResponseHandler } = {};
  private _requestId = 0;
  private _requestChannel: string;
  private _responseChannel: string;
  private _parent?: boolean;

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
    this._initChannels();
  }

  public _initChannels() {
    window.addEventListener("message", this._handleRpcResponse.bind(this));
  }

  private _handleRpcResponse(event: Event) {
    if (event.data.type !== this._responseChannel) return;

    const { id, result } = event.data.detail;
    const resolver = this._responseResolvers[id];
    if (!resolver) {
      logger.error("unexpected event", event);
      throw new Error("unexpected event");
    }
    delete this._responseResolvers[id];
    const [resolve, reject] = resolver;
    resolve(result);
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
        { type: this._requestChannel, detail: { id, method, params } },
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

  public async response<T = any>(resp: RpcResponse): Promise<RpcResponse<T>> {
    throw new Error("response not implemented");
  }

  // This must be called before `window.dipsatchEvent`.
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
