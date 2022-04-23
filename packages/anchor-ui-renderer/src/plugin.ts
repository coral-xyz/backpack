import { PublicKey } from "@solana/web3.js";
import {
  UpdateDiff,
  Element,
  TextSerialized,
  NodeSerialized,
} from "@200ms/anchor-ui";
import {
  getLogger,
  Event,
  CHANNEL_PLUGIN_RPC_REQUEST,
  CHANNEL_PLUGIN_RPC_RESPONSE,
  CHANNEL_PLUGIN_REACT_RECONCILER_BRIDGE,
  RECONCILER_BRIDGE_METHOD_COMMIT_UPDATE,
  RECONCILER_BRIDGE_METHOD_COMMIT_TEXT_UPDATE,
  RECONCILER_BRIDGE_METHOD_APPEND_CHILD_TO_CONTAINER,
  RECONCILER_BRIDGE_METHOD_APPEND_CHILD,
  RECONCILER_BRIDGE_METHOD_INSERT_IN_CONTAINER_BEFORE,
  RECONCILER_BRIDGE_METHOD_INSERT_BEFORE,
  RECONCILER_BRIDGE_METHOD_REMOVE_CHILD,
  RECONCILER_BRIDGE_METHOD_REMOVE_CHILD_FROM_CONTAINER,
  Channel,
  PostMessageServer,
  RpcResponse,
  PLUGIN_RPC_METHOD_CONNECT,
} from "@200ms/common";

const logger = getLogger("plugin");

//
// A plugin is a react bundle served from a given URL, using the anchor ui
// framework + protocol to render its views inside the native wallet interface.
//
// This class is effectively the model. To display a plugin, create one of
// these objects and then pass it into the renderer component.
//
export class Plugin {
  private _activeWallet: PublicKey;
  private _connectionUrl: string;
  private _rpcServer: PostMessageServer;
  private _bridgeServer: PostMessageServer;
  private _iframe: any;
  private _nextRenderId?: number;
  private _pendingBridgeRequests?: Array<any>;
  private _dom?: Dom;

  private _didFinishSetup?: Promise<void>;
  private _didFinishSetupResolver?: () => void;

  readonly iframeUrl: string;
  readonly iconUrl: string;
  readonly title: string;

  constructor(
    url: string,
    iconUrl: string,
    title: string,
    activeWallet: PublicKey,
    connectionUrl: string
  ) {
    //
    // Provide connection for the plugin.
    //
    this._activeWallet = activeWallet;
    this._connectionUrl = connectionUrl;
    this.title = title;
    this.iframeUrl = url;
    this.iconUrl = iconUrl;

    //
    // RPC Server channel from plugin -> extension-ui.
    //
    this._rpcServer = Channel.serverPostMessage(
      CHANNEL_PLUGIN_RPC_REQUEST,
      CHANNEL_PLUGIN_RPC_RESPONSE
    );
    this._rpcServer.handler(this._handleRpc.bind(this));

    //
    // React reconciler bridge messages for custom React rendering.
    //
    this._bridgeServer = Channel.serverPostMessage(
      CHANNEL_PLUGIN_REACT_RECONCILER_BRIDGE
    );
    this._bridgeServer.handler(this._handleBridge.bind(this));
  }

  //
  // Loads the plugin javascript code inside the iframe.
  //
  public create() {
    logger.debug("creating iframe element");

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
    this._iframe.src = this.iframeUrl;
    this._iframe.allow = `'src'`;
    document.head.appendChild(this._iframe);
    this._rpcServer.setWindow(this._iframe.contentWindow);
    this._bridgeServer.setWindow(this._iframe.contentWindow);
    this._dom = new Dom();
    this._pendingBridgeRequests = [];

    //
    // Done.
    //
    this._didFinishSetupResolver!();
  }

  //
  // Cleanup the plugin iframe and garbage collect all associated data.
  //
  public destroy() {
    logger.debug("destroying iframe element");
    document.head.removeChild(this._iframe);
    this._iframe.remove();
    this._iframe = undefined;
    this._rpcServer.setWindow(undefined);
    this._bridgeServer.setWindow(undefined);
    this._didFinishSetup = undefined;
    this._didFinishSetupResolver = undefined;
    this._nextRenderId = undefined;
    this._dom = undefined;
    this._pendingBridgeRequests = undefined;
  }

  //
  // Register a callback for when the plugin needs to rerender the root
  // DOM element.
  //
  public onRenderRoot(fn: (children: Array<Element>) => void) {
    if (!this._dom) {
      throw new Error("dom not found");
    }
    this._dom.onRenderRoot(fn);
  }

  //
  // Register a callback for when the plugin needs to rerender the given
  // DOM element (and all children).
  //
  public onRender(viewId: number, fn: (data: Element) => void) {
    if (!this._dom) {
      throw new Error("dom not found");
    }
    this._dom.onRender(viewId, fn);
  }

  //////////////////////////////////////////////////////////////////////////////
  // RPC Requests.
  //////////////////////////////////////////////////////////////////////////////

  private async _handleRpc(event: Event): Promise<RpcResponse> {
    const req = event.data.detail;
    logger.debug(`plugin rpc: ${JSON.stringify(req)}`);
    const { method, params } = req;
    switch (method) {
      case PLUGIN_RPC_METHOD_CONNECT:
        return await this._handleConnect();
      default:
        logger.error(method);
        throw new Error("unexpected method");
    }
  }

  private async _handleConnect(): Promise<RpcResponse> {
    await this._didFinishSetup;
    const resp = [this._activeWallet.toString(), this._connectionUrl];
    return [resp];
  }

  //////////////////////////////////////////////////////////////////////////////
  // React Reconciler Bridge.
  //////////////////////////////////////////////////////////////////////////////

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
    this._pendingBridgeRequests!.push(req);
    this._pendingBridgeRequests!.sort((a, b) => a.renderId - b.renderId);
  }

  private _needsBridgeProcessing(): boolean {
    if (this._nextRenderId === undefined) {
      throw new Error("render id not set");
    }
    if (this._pendingBridgeRequests!.length === 0) {
      return false;
    }
    let nextReq = this._pendingBridgeRequests![0];
    return nextReq.renderId === this._nextRenderId;
  }

  private _processNextBridgeRequest() {
    if (this._nextRenderId === undefined) {
      throw new Error("render id not set");
    }
    if (!this._dom) {
      throw new Error("dom not defined");
    }

    const nextReq = this._pendingBridgeRequests![0];
    this._pendingBridgeRequests = this._pendingBridgeRequests!.slice(1);

    logger.debug("processing next bridge request", nextReq);

    const { method, params } = nextReq;
    switch (method) {
      case RECONCILER_BRIDGE_METHOD_COMMIT_UPDATE:
        this._dom._handleCommitUpdate(params[0], params[1]);
        break;
      case RECONCILER_BRIDGE_METHOD_COMMIT_TEXT_UPDATE:
        this._dom._handleCommitTextUpdate(params[0], params[1]);
        break;
      case RECONCILER_BRIDGE_METHOD_APPEND_CHILD_TO_CONTAINER:
        this._dom._handleAppendChildToContainer(params[0]);
        break;
      case RECONCILER_BRIDGE_METHOD_APPEND_CHILD:
        this._dom._handleAppendChild(params[0], params[1]);
        break;
      case RECONCILER_BRIDGE_METHOD_INSERT_IN_CONTAINER_BEFORE:
        this._dom._handleInsertInContainerBefore(params[0], params[1]);
        break;
      case RECONCILER_BRIDGE_METHOD_INSERT_BEFORE:
        this._dom._handleInsertBefore(params[0], params[1], params[2]);
        break;
      case RECONCILER_BRIDGE_METHOD_REMOVE_CHILD:
        this._dom._handleRemoveChild(params[0], params[1]);
        break;
      case RECONCILER_BRIDGE_METHOD_REMOVE_CHILD_FROM_CONTAINER:
        this._dom._handleRemoveChildFromContainer(params[0]);
        break;
      default:
        logger.error(method);
        throw new Error("unexpected method");
    }

    this._nextRenderId += 1;
  }
}

//
// Note that we only handle methods in the "commit" phase of the react
// reconciler API.
//
class Dom {
  //
  // All Element objects in the dom. The _vdom elements and the _vdomRoot
  // elements are the same objects.
  //
  private _vdom: Map<number, Element>;
  private _vdomRoot: { children: Array<Element> };
  //
  // _renderFn maps node ID -> renderer function so that we only rerender
  // components that update.
  //
  private _renderFns: Map<number, (data: Element) => void>;
  //
  // Rerenders the root component.
  //
  private _renderRootFn?: (data: Array<Element>) => void;

  constructor() {
    this._vdomRoot = { children: [] };
    this._vdom = new Map();
    this._renderFns = new Map();
  }

  onRender(viewId: number, fn: (data: Element) => void) {
    this._renderFns.set(viewId, fn);
  }

  onRenderRoot(fn: (data: Array<Element>) => void) {
    this._renderRootFn = fn;
  }

  _handleCommitUpdate(instanceId: number, updatePayload: UpdateDiff) {
    const instance = this._vdom.get(instanceId) as NodeSerialized;
    // todo
    this._render(instanceId);
  }

  _handleCommitTextUpdate(textInstanceId: number, newText: string) {
    const textInstance = this._vdom.get(textInstanceId) as TextSerialized;
    textInstance.text = newText;
    this._render(textInstanceId);
  }

  _handleAppendChildToContainer(child: Element) {
    this._vdomRoot.children.push(child);

    this._saveToDom(child);
    this._renderRoot();
  }

  _handleAppendChild(parentId: number, child: Element) {
    const instance = this._vdom.get(parentId) as NodeSerialized;
    instance.children.push(child);

    this._saveToDom(child);
    this._render(parentId);
  }

  //
  // This method can be called for insertions as well as reordering, so we
  // remove the new child and do an insertion each time.
  //
  _handleInsertInContainerBefore(child: Element, beforeId: number) {
    const element = this._vdomRoot.children.find((e) => e.id === beforeId);
    if (!element) {
      throw new Error("element not found");
    }
    const newChildren = this._vdomRoot.children.filter(
      (c: Element) => c.id !== child.id
    );
    const idx = newChildren.indexOf(element);
    if (idx === -1) {
      throw new Error("child not found");
    }
    this._vdomRoot.children = newChildren
      .slice(0, idx)
      .concat([child])
      .concat(newChildren.slice(idx));

    this._saveToDom(child);
    this._renderRoot();
  }

  //
  // This method can be called for insertions as well as reordering, so we
  // remove the new child and do an insertion each time.
  //
  _handleInsertBefore(parentId: number, child: Element, beforeId: number) {
    const parent = this._vdom.get(parentId) as NodeSerialized;
    if (!parent) {
      throw new Error("parent not found");
    }
    const beforeElement = parent.children.find(
      (e: Element) => e.id === beforeId
    ) as NodeSerialized;
    if (!beforeElement) {
      logger.error("before element not found", parent, child, beforeId);
      throw new Error("before element not found");
    }

    const newChildren = beforeElement.children.filter(
      (c: Element) => c.id !== child.id
    );
    const beforeIdx = newChildren.indexOf(beforeElement);
    if (beforeIdx === -1) {
      throw new Error("child not found");
    }

    beforeElement.children = newChildren
      .slice(0, beforeIdx)
      .concat([child])
      .concat(newChildren.slice(beforeIdx));

    this._saveToDom(child);
    this._render(parentId);
  }

  _handleRemoveChild(parentId: number, childId: number) {
    const parent = this._vdom.get(parentId) as NodeSerialized;
    if (!parent) {
      throw new Error("parent not found");
    }
    parent.children = parent.children.filter((c: Element) => c.id !== childId);
    this._removeFromDom(this._vdom.get(childId)!);
    this._render(parentId);
  }

  _handleRemoveChildFromContainer(childId: number) {
    this._vdomRoot.children = this._vdomRoot.children.filter(
      (c) => c.id !== childId
    );
    this._removeFromDom(this._vdom.get(childId)!);
    this._renderRoot();
  }

  private _renderRoot() {
    if (!this._renderRootFn) {
      throw new Error("render root fn not found");
    }
    this._renderRootFn(this._vdomRoot.children);
  }

  private _render(instanceId: number) {
    const element = this._vdom.get(instanceId);
    if (!element) {
      throw new Error("element not found");
    }
    const renderFn = this._renderFns.get(instanceId);
    if (!renderFn) {
      throw new Error("render fn not found");
    }
    renderFn(element);
  }

  private _saveToDom(element: Element) {
    this._vdom.set(element.id, element);
    // @ts-ignore
    if (element.children) {
      // @ts-ignore
      element.children.forEach((e: Element) => {
        this._saveToDom(e);
      });
    }
  }

  private _removeFromDom(element: Element) {
    this._vdom.delete(element.id);
    // @ts-ignore
    if (element.children) {
      // @ts-ignore
      element.children.forEach((e: Element) => {
        this._removeFromDom(e);
      });
    }
  }
}
