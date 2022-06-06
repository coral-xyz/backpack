import type { PublicKey } from "@solana/web3.js";
import {
  NodeKind,
  UpdateDiff,
  Element,
  TextSerialized,
  NodeSerialized,
} from "@200ms/anchor-ui";
import {
  getLogger,
  BackgroundClient,
  Event,
  Channel,
  PostMessageServer,
  RpcResponse,
  NAV_COMPONENT_PLUGIN_TABLE_DETAIL,
  CHANNEL_PLUGIN_RPC_REQUEST,
  CHANNEL_PLUGIN_RPC_RESPONSE,
  CHANNEL_PLUGIN_NOTIFICATION,
  CHANNEL_PLUGIN_REACT_RECONCILER_BRIDGE,
  CHANNEL_PLUGIN_CONNECTION_BRIDGE,
  PLUGIN_RPC_METHOD_NAV_PUSH,
  PLUGIN_RPC_METHOD_NAV_POP,
  RPC_METHOD_SIGN_TX as PLUGIN_RPC_METHOD_SIGN_TX,
  RPC_METHOD_SIGN_AND_SEND_TX as PLUGIN_RPC_METHOD_SIGN_AND_SEND_TX,
  RPC_METHOD_SIMULATE as PLUGIN_RPC_METHOD_SIMULATE_TX,
  PLUGIN_NOTIFICATION_CONNECT,
  PLUGIN_NOTIFICATION_ON_CLICK,
  PLUGIN_NOTIFICATION_ON_CHANGE,
  PLUGIN_NOTIFICATION_MOUNT,
  PLUGIN_NOTIFICATION_UNMOUNT,
  PLUGIN_NOTIFICATION_NAVIGATION_POP,
  PLUGIN_NOTIFICATION_CONNECTION_URL_UPDATED,
  PLUGIN_NOTIFICATION_PUBLIC_KEY_UPDATED,
  RECONCILER_BRIDGE_METHOD_COMMIT_UPDATE,
  RECONCILER_BRIDGE_METHOD_COMMIT_TEXT_UPDATE,
  RECONCILER_BRIDGE_METHOD_APPEND_CHILD_TO_CONTAINER,
  RECONCILER_BRIDGE_METHOD_APPEND_CHILD,
  RECONCILER_BRIDGE_METHOD_INSERT_IN_CONTAINER_BEFORE,
  RECONCILER_BRIDGE_METHOD_INSERT_BEFORE,
  RECONCILER_BRIDGE_METHOD_REMOVE_CHILD,
  RECONCILER_BRIDGE_METHOD_REMOVE_CHILD_FROM_CONTAINER,
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
  private _connectionBridge: PostMessageServer;
  private _iframe?: HTMLIFrameElement;
  private _nextRenderId?: number;
  private _pendingBridgeRequests?: Array<any>;
  private _dom?: Dom;

  private _didFinishSetup?: Promise<void>;
  private _didFinishSetupResolver?: () => void;

  //
  // Host APIs.
  //
  private _navPushFn?: (args: any) => void;
  private _requestTxApprovalFn?: (request: any) => void;
  private _connectionBackgroundClient: BackgroundClient;

  //
  // The last time a click event was handled for the plugin. This is used as an
  // approximation to ensure the trusted transaction signing view can only be
  // displayed in the context of a click handler.
  //
  private _lastClickTsMs?: number;

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
      url,
      CHANNEL_PLUGIN_RPC_REQUEST,
      CHANNEL_PLUGIN_RPC_RESPONSE
    );
    this._rpcServer.handler(this._handleRpc.bind(this));

    //
    // React reconciler bridge messages for custom React rendering.
    //
    this._bridgeServer = Channel.serverPostMessage(
      url,
      CHANNEL_PLUGIN_REACT_RECONCILER_BRIDGE
    );
    this._bridgeServer.handler(this._handleBridge.bind(this));

    //
    // Bridges messages for the solana connection object from the plugin
    // to the background script.
    //
    this._connectionBridge = Channel.serverPostMessage(
      url,
      CHANNEL_PLUGIN_CONNECTION_BRIDGE
    );
    this._connectionBridge.handler(this._handleConnectionBridge.bind(this));
  }

  public get needsLoad() {
    return this._navPushFn === undefined;
  }

  //
  // Loads the plugin javascript code inside the iframe.
  //
  public createIframe() {
    logger.debug("creating iframe element");

    //
    // Effectively take a lock that's held until the setup is complete.
    //
    this._didFinishSetup = new Promise((resolve) => {
      this._didFinishSetupResolver = resolve;
    });

    this._nextRenderId = 0;
    this._iframe = document.createElement("iframe");
    this._iframe!.src = this.iframeUrl;
    this._iframe.sandbox.add("allow-same-origin");
    this._iframe.sandbox.add("allow-scripts");
    this._iframe!.onload = async () => {
      this._rpcServer.setWindow(this._iframe!.contentWindow);
      this._bridgeServer.setWindow(this._iframe!.contentWindow);
      this._dom = new Dom();
      this._pendingBridgeRequests = [];
      this.pushConnectNotification();

      //
      // Done.
      //
      this._didFinishSetupResolver!();
    };
    document.head.appendChild(this._iframe);
  }

  //
  // Cleanup the plugin iframe and garbage collect all associated data.
  //
  public destroyIframe() {
    logger.debug("destroying iframe element");

    document.head.removeChild(this._iframe!);
    this._iframe!.remove();
    this._iframe = undefined;
    this._rpcServer.setWindow(undefined);
    this._bridgeServer.setWindow(undefined);
    this._nextRenderId = undefined;
    this._dom = undefined;
    this._pendingBridgeRequests = undefined;
  }

  //
  // Apis set from the outside host.
  //
  public setHostApi({ push, pop, request, connectionBackgroundClient }) {
    this._navPushFn = push;
    this._requestTxApprovalFn = request;
    this._connectionBackgroundClient = connectionBackgroundClient;
  }

  //////////////////////////////////////////////////////////////////////////////
  // Rendering.
  //////////////////////////////////////////////////////////////////////////////

  public mount() {
    if (this._didFinishSetup === undefined) {
      throw new Error("plugin not setup");
    }
    this._didFinishSetup.then(() => {
      this.pushMountNotification();
    });
  }

  public unmount() {
    this._dom?.clear();
    this.pushUnmountNotification();
  }

  //
  // Register a callback for when the plugin needs to rerender the root
  // DOM element.
  //
  public onRenderRoot(fn: (children: Array<Element>) => void) {
    this._didFinishSetup!.then(() => {
      if (!this._dom) {
        throw new Error("on render root dom not found");
      }
      this._dom.onRenderRoot(fn);
    });
  }

  //
  // Register a callback for when the plugin needs to rerender the given
  // DOM element (and all children).
  //
  public onRender(viewId: number, fn: (data: Element) => void) {
    this._didFinishSetup!.then(() => {
      if (!this._dom) {
        throw new Error("on render dom not found");
      }
      this._dom.onRender(viewId, fn);
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // Push Notifications to Plugin iFrame.
  //
  // TODO: serialize ordering of  notification delivery.
  //////////////////////////////////////////////////////////////////////////////

  public pushNotification(notif: any) {
    const event = {
      type: CHANNEL_PLUGIN_NOTIFICATION,
      detail: notif,
    };
    this._iframe!.contentWindow!.postMessage(event, "*");
  }

  public pushClickNotification(viewId: number) {
    this._lastClickTsMs = Date.now();
    const event = {
      type: CHANNEL_PLUGIN_NOTIFICATION,
      detail: {
        name: PLUGIN_NOTIFICATION_ON_CLICK,
        data: {
          viewId,
        },
      },
    };
    this._iframe!.contentWindow!.postMessage(event, "*");
  }

  public pushOnChangeNotification(viewId: number, value: any) {
    this._lastClickTsMs = Date.now();
    const event = {
      type: CHANNEL_PLUGIN_NOTIFICATION,
      detail: {
        name: PLUGIN_NOTIFICATION_ON_CHANGE,
        data: {
          viewId,
          value,
        },
      },
    };
    this._iframe!.contentWindow!.postMessage(event, "*");
  }

  public pushConnectNotification() {
    const event = {
      type: CHANNEL_PLUGIN_NOTIFICATION,
      detail: {
        name: PLUGIN_NOTIFICATION_CONNECT,
        data: {
          publicKey: this._activeWallet.toString(),
          connectionUrl: this._connectionUrl,
        },
      },
    };
    this._iframe!.contentWindow!.postMessage(event, "*");
  }

  public pushMountNotification() {
    const event = {
      type: CHANNEL_PLUGIN_NOTIFICATION,
      detail: {
        name: PLUGIN_NOTIFICATION_MOUNT,
        data: {},
      },
    };
    this._iframe!.contentWindow!.postMessage(event, "*");
  }

  public pushUnmountNotification() {
    const event = {
      type: CHANNEL_PLUGIN_NOTIFICATION,
      detail: {
        name: PLUGIN_NOTIFICATION_UNMOUNT,
        data: {},
      },
    };
    this._iframe!.contentWindow!.postMessage(event, "*");
  }

  public pushNavigationPopNotification() {
    const event = {
      type: CHANNEL_PLUGIN_NOTIFICATION,
      detail: {
        name: PLUGIN_NOTIFICATION_NAVIGATION_POP,
        data: {},
      },
    };
    this._iframe!.contentWindow!.postMessage(event, "*");
  }

  public pushConnectionChangedNotification(url: string) {
    const event = {
      type: CHANNEL_PLUGIN_NOTIFICATION,
      detail: {
        name: PLUGIN_NOTIFICATION_CONNECTION_URL_UPDATED,
        data: {
          url,
        },
      },
    };
    this._iframe!.contentWindow!.postMessage(event, "*");
  }

  public pushPublicKeyChangedNotification(publicKey: string) {
    const event = {
      type: CHANNEL_PLUGIN_NOTIFICATION,
      detail: {
        name: PLUGIN_NOTIFICATION_PUBLIC_KEY_UPDATED,
        data: {
          publicKey,
        },
      },
    };
    this._iframe!.contentWindow!.postMessage(event, "*");
  }

  //////////////////////////////////////////////////////////////////////////////
  // RPC Requests.
  //////////////////////////////////////////////////////////////////////////////

  private async _handleRpc(event: Event): Promise<RpcResponse> {
    const req = event.data.detail;
    logger.debug(`plugin rpc: ${JSON.stringify(req)}`);

    const { method, params } = req;
    switch (method) {
      case PLUGIN_RPC_METHOD_NAV_PUSH:
        return await this._handleNavPush();
      case PLUGIN_RPC_METHOD_NAV_POP:
        return await this._handleNavPop();
      case PLUGIN_RPC_METHOD_SIGN_TX:
        return await this._handleSignTransaction(params[0], params[1]);
      case PLUGIN_RPC_METHOD_SIGN_AND_SEND_TX:
        return await this._handleSignAndSendTransaction(params[0], params[1]);
      case PLUGIN_RPC_METHOD_SIMULATE_TX:
        return await this._handleSimulate(params[0], params[1]);
      default:
        logger.error(method);
        throw new Error("unexpected method");
    }
  }

  private async _handleNavPush(): Promise<RpcResponse> {
    this._navPushFn!({
      title: this.iframeUrl,
      componentId: NAV_COMPONENT_PLUGIN_TABLE_DETAIL,
      componentProps: {
        pluginUrl: this.iframeUrl,
      },
    });
    return ["success"];
  }

  private async _handleNavPop(): Promise<RpcResponse> {
    // todo
    return ["success"];
  }

  private async _handleSignTransaction(
    transaction: string,
    pubkey: string
  ): Promise<RpcResponse> {
    const err = this.clickHandlerError();
    if (err) {
      return err;
    }

    try {
      const signature = await this._requestTransactionApproval(
        "sign-tx",
        transaction,
        pubkey
      );
      return [signature];
    } catch (err) {
      return [null, err.toString()];
    }
  }

  private async _handleSignAndSendTransaction(
    transaction: string,
    pubkey: string
  ): Promise<RpcResponse> {
    const err = this.clickHandlerError();
    if (err) {
      return err;
    }

    try {
      const signature = await this._requestTransactionApproval(
        "sign-and-send-tx",
        transaction,
        pubkey
      );
      return [signature];
    } catch (err) {
      return [null, err.toString()];
    }
  }

  private async _handleSimulate(
    transaction: string,
    pubkey: string
  ): Promise<RpcResponse> {
    // todo
    return ["success"];
  }

  private clickHandlerError(): RpcResponse | null {
    if (!this._lastClickTsMs) {
      return ["error"];
    }
    const timeLapsed = Date.now() - this._lastClickTsMs;
    if (timeLapsed >= 1000) {
      return ["error"];
    }
    return null;
  }

  //
  // Asks the extension UI to sign the transaction.
  //
  private async _requestTransactionApproval(
    kind: string,
    transaction: string,
    publicKey: string
  ): Promise<string | null> {
    return new Promise<string | null>((resolve, reject) => {
      this._requestTxApprovalFn!({
        kind,
        data: transaction,
        pluginUrl: this.iframeUrl,
        publicKey,
        resolve,
        reject,
      });
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // Solana Connection Bridge.
  //////////////////////////////////////////////////////////////////////////////

  //
  // Relay all requests to the background service worker.
  //
  private async _handleConnectionBridge(event: Event): Promise<RpcResponse> {
    logger.debug(`handle connection bridge`, event);
    return await this._connectionBackgroundClient.request(event.data.detail);
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
        this._dom.commitUpdate(params[0], params[1]);
        break;
      case RECONCILER_BRIDGE_METHOD_COMMIT_TEXT_UPDATE:
        this._dom.commitTextUpdate(params[0], params[1]);
        break;
      case RECONCILER_BRIDGE_METHOD_APPEND_CHILD_TO_CONTAINER:
        this._dom.appendChildToContainer(params[0]);
        break;
      case RECONCILER_BRIDGE_METHOD_APPEND_CHILD:
        this._dom.appendChild(params[0], params[1]);
        break;
      case RECONCILER_BRIDGE_METHOD_INSERT_IN_CONTAINER_BEFORE:
        this._dom.insertInContainerBefore(params[0], params[1]);
        break;
      case RECONCILER_BRIDGE_METHOD_INSERT_BEFORE:
        this._dom.insertBefore(params[0], params[1], params[2]);
        break;
      case RECONCILER_BRIDGE_METHOD_REMOVE_CHILD:
        this._dom.removeChild(params[0], params[1]);
        break;
      case RECONCILER_BRIDGE_METHOD_REMOVE_CHILD_FROM_CONTAINER:
        this._dom.removeChildFromContainer(params[0]);
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
  //
  // True when render root was called before setup was complete.
  //
  private _needsRenderRoot: boolean;

  constructor() {
    this.clear();
  }

  clear() {
    this._vdomRoot = { children: [] };
    this._vdom = new Map();
    this._renderFns = new Map();
  }

  onRender(viewId: number, fn: (data: Element) => void) {
    this._renderFns.set(viewId, fn);
  }

  onRenderRoot(fn: (data: Array<Element>) => void) {
    this._renderRootFn = fn;
    if (this._needsRenderRoot) {
      this._needsRenderRoot = false;
      this._renderRoot();
    }
  }

  commitUpdate(instanceId: number, updatePayload: UpdateDiff) {
    const instance = this._vdom.get(instanceId) as NodeSerialized;

    logger.debug("commitUpdate", instance);

    switch (instance.kind) {
      case NodeKind.View:
        if (updatePayload.style) {
          instance.style = updatePayload.style;
        }
        break;
      case NodeKind.TextField:
        if (updatePayload.value !== undefined && updatePayload.value !== null) {
          instance.props.value = updatePayload.value;
        }
        break;
      default:
        throw new Error("invariant violation");
    }
    this._render(instanceId);
  }

  commitTextUpdate(textInstanceId: number, newText: string) {
    const textInstance = this._vdom.get(textInstanceId) as TextSerialized;
    textInstance.text = newText;
    this._render(textInstanceId);
  }

  appendChildToContainer(child: Element) {
    this._vdomRoot.children.push(child);

    this._saveToDom(child);
    this._renderRoot();
  }

  appendChild(parentId: number, child: Element) {
    const instance = this._vdom.get(parentId) as NodeSerialized;
    instance.children.push(child);

    this._saveToDom(child);
    this._render(parentId);
  }

  //
  // This method can be called for insertions as well as reordering, so we
  // remove the new child and do an insertion each time.
  //
  insertInContainerBefore(child: Element, beforeId: number) {
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
  insertBefore(parentId: number, child: Element, beforeId: number) {
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

  removeChild(parentId: number, childId: number) {
    const parent = this._vdom.get(parentId) as NodeSerialized;
    if (!parent) {
      throw new Error("parent not found");
    }
    parent.children = parent.children.filter((c: Element) => c.id !== childId);
    this._removeFromDom(this._vdom.get(childId)!);
    this._render(parentId);
  }

  removeChildFromContainer(childId: number) {
    this._vdomRoot.children = this._vdomRoot.children.filter(
      (c) => c.id !== childId
    );
    this._removeFromDom(this._vdom.get(childId)!);
    this._renderRoot();
  }

  _renderRoot() {
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
