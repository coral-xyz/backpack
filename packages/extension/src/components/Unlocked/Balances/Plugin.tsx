import { PublicKey } from "@solana/web3.js";
import { Element } from "@200ms/anchor-ui";
import { debug, Event } from "@200ms/common";
import {
  CHANNEL_PLUGIN_RPC_REQUEST,
  CHANNEL_PLUGIN_RPC_RESPONSE,
  CHANNEL_PLUGIN_REACT_RECONCILER_BRIDGE,
  RECONCILER_BRIDGE_METHOD_COMMIT_UPDATE,
  RECONCILER_BRIDGE_METHOD_INITIAL_RENDER,
  Channel,
  PostMessageServer,
  Context,
  withContext,
  RpcRequest,
  RpcResponse,
  PLUGIN_RPC_METHOD_CONNECT,
} from "../../../common";

export class Plugin {
  private _activeWallet: PublicKey;
  private _connectionUrl: string;
  private _initRenderFn?: (data: Array<Element>) => void;
  private _renderFn: Map<number, (data: Element) => void>;
  private _rpcServer: PostMessageServer;
  private _bridgeServer: PostMessageServer;
  private _iframe: any;
  private _iframeUrl: string;
  private _didFinishSetup?: Promise<void>;
  private _didFinishSetupResolver?: () => void;
  private _nextRenderId?: number;
  private _pendingBridgeRequests: Array<any>;

  constructor(url: string, activeWallet: PublicKey, connectionUrl: string) {
    //
    // Provide connection for the plugin.
    //
    this._activeWallet = activeWallet;
    this._connectionUrl = connectionUrl;

    //
    // _renderFn maps node ID -> renderer function so that we only rerender
    // components that update.
    //
    this._renderFn = new Map();
    this._pendingBridgeRequests = [];

    //
    // Inject the plugin iframe.
    //
    this._iframeUrl = url;

    //
    // RPC Server channel.
    //
    this._rpcServer = Channel.serverPostMessage(
      CHANNEL_PLUGIN_RPC_REQUEST,
      CHANNEL_PLUGIN_RPC_RESPONSE
    );
    this._rpcServer.handler(this._handleRpc.bind(this));

    //
    // React reconciler bridge messages for app rendering.
    //
    this._bridgeServer = Channel.serverPostMessage(
      CHANNEL_PLUGIN_REACT_RECONCILER_BRIDGE
    );
    this._bridgeServer.handler(this._handleBridge.bind(this));
  }

  public create() {
    debug("creating iframe element");

    //
    // Promise resolves when the constructor finishes. This prevents a
    // race condition between this constructor and the injected iframe,
    // since we first create the iframe and then setup the rpc request
    // handlers.
    //
    this._didFinishSetup = new Promise((resolve) => {
      this._didFinishSetupResolver = resolve;
    });

    this._nextRenderId = 0;
    this._iframe = document.createElement("iframe");
    this._iframe.src = this._iframeUrl;
    this._iframe.allow = `'src'`;
    document.head.appendChild(this._iframe);
    this._rpcServer.setWindow(this._iframe.contentWindow);
    this._bridgeServer.setWindow(this._iframe.contentWindow);

    //
    // Done.
    //
    this._didFinishSetupResolver!();
  }

  public destroy() {
    debug("destroying iframe element");
    document.head.removeChild(this._iframe);
    this._iframe.remove();
    this._iframe = undefined;
    this._rpcServer.setWindow(undefined);
    this._bridgeServer.setWindow(undefined);
    this._didFinishSetup = undefined;
    this._didFinishSetupResolver = undefined;
    this._nextRenderId = undefined;
  }

  private async _handleRpc(event: Event): Promise<RpcResponse> {
    const req = event.data.detail;
    debug(`plugin rpc: ${JSON.stringify(req)}`);
    const { method, params } = req;
    switch (method) {
      case PLUGIN_RPC_METHOD_CONNECT:
        return await this._handleConnect();
      default:
        console.error(method);
        throw new Error("unexpected method");
    }
  }

  private async _handleConnect(): Promise<RpcResponse> {
    await this._didFinishSetup;
    const resp = [this._activeWallet.toString(), this._connectionUrl];
    return [resp];
  }

  //
  // Note that all the bridge requests must be processed in order.
  // In the event we receive request out of order, we queue them up
  // and do nothing until the next ordered request comes in.
  //
  private _handleBridge(event: Event): RpcResponse {
    const req = event.data.detail;

    this._enqueueBridgeRequest(req);
    while (this._needsBridgeProcessing()) {
      this._processNextBridgeRequest();
    }

    return ["success"];
  }

  private _enqueueBridgeRequest(req: any) {
    this._pendingBridgeRequests.push(req);
    this._pendingBridgeRequests.sort((a, b) => a.renderId - b.renderId);
  }

  private _needsBridgeProcessing(): boolean {
    if (this._nextRenderId === undefined) {
      throw new Error("render id not set");
    }
    if (this._pendingBridgeRequests.length === 0) {
      return false;
    }
    let nextReq = this._pendingBridgeRequests[0];
    return nextReq.renderId === this._nextRenderId;
  }

  private _processNextBridgeRequest() {
    if (this._nextRenderId === undefined) {
      throw new Error("render id not set");
    }

    const nextReq = this._pendingBridgeRequests[0];
    this._pendingBridgeRequests = this._pendingBridgeRequests.slice(1);
    const { method, params } = nextReq;
    switch (method) {
      case RECONCILER_BRIDGE_METHOD_INITIAL_RENDER:
        this._handleInitialRender(params[0]);
        break;
      case RECONCILER_BRIDGE_METHOD_COMMIT_UPDATE:
        this._handleCommitUpdate(params[0]);
        break;
      default:
        console.error(method);
        throw new Error("unexpected method");
    }

    this._nextRenderId += 1;
  }

  private _handleInitialRender(instances: Array<Element>) {
    if (!this._initRenderFn) {
      throw new Error("init render function not set");
    }
    this._initRenderFn(instances);
  }

  private _handleCommitUpdate(instance: Element) {
    this._renderFn.get(instance.id)!(instance);
  }

  onInitRender(fn: (data: Array<Element>) => void) {
    this._initRenderFn = fn;
  }

  onRender(viewId: number, fn: (data: Element) => void) {
    this._renderFn.set(viewId, fn);
  }
}
