import { EventEmitter } from "eventemitter3";
import {
  RpcRequest,
  RequestManager,
  Event,
  CHANNEL_PLUGIN_NOTIFICATION,
  CHANNEL_PLUGIN_RPC_REQUEST,
  CHANNEL_PLUGIN_RPC_RESPONSE,
  CHANNEL_PLUGIN_REACT_RECONCILER_BRIDGE,
  PLUGIN_NOTIFICATION_CONNECT,
  PLUGIN_NOTIFICATION_ON_CLICK,
  PLUGIN_NOTIFICATION_MOUNT,
  PLUGIN_NOTIFICATION_UNMOUNT,
  PLUGIN_RPC_METHOD_CONNECT,
  PLUGIN_RPC_METHOD_NAV_PUSH,
  PLUGIN_RPC_METHOD_NAV_POP,
  PLUGIN_RPC_METHOD_DID_LOAD,
  PLUGIN_NOTIFICATION_NAVIGATION_POP,
} from "@200ms/common";

//
// Injected provider for UI plugins. Using this from a non approved plugins
// will fail.
//
export class ProviderUiInjection extends EventEmitter {
  private _renderId: number;
  private _requestManager: RequestManager;

  constructor() {
    super();
    this._renderId = 0;
    this._requestManager = new RequestManager(
      CHANNEL_PLUGIN_RPC_REQUEST,
      CHANNEL_PLUGIN_RPC_RESPONSE,
      true
    );
    this._setupChannels();
  }

  private _setupChannels() {
    window.addEventListener("message", this._handleNotifications.bind(this));
  }

  //
  // Notifications the extension UI -> plugin.
  //
  private async _handleNotifications(event: Event) {
    if (event.data.type !== CHANNEL_PLUGIN_NOTIFICATION) return;

    const { name } = event.data.detail;
    switch (name) {
      case PLUGIN_NOTIFICATION_CONNECT:
        this._handleConnect(event);
        break;
      case PLUGIN_NOTIFICATION_MOUNT:
        this._handleMount(event);
        break;
      case PLUGIN_NOTIFICATION_UNMOUNT:
        this._handleUnmount(event);
        break;
      case PLUGIN_NOTIFICATION_ON_CLICK:
        this._handleOnClick(event);
        break;
      case PLUGIN_NOTIFICATION_NAVIGATION_POP:
        this._handleNavigationPop(event);
        break;
      default:
        console.error(event);
        throw new Error("invalid notification");
    }
  }

  private _handleConnect(event: Event) {
    const { publicKey, connectionUrl } = event.data.detail.data;
    window.anchor._connect(publicKey, connectionUrl);
    this.emit("connect", event.data.detail);
  }

  private _handleMount(event: Event) {
    this.emit("mount", event.data.detail);
  }

  private _handleUnmount(event: Event) {
    this.emit("unmount", event.data.detail);
  }

  private _handleOnClick(event: Event) {
    this.emit("click", event.data.detail);
  }

  private _handleNavigationPop(event: Event) {
    this.emit("pop", event.data.detail);
  }

  public async navigationPush() {
    await this._requestManager.request({
      method: PLUGIN_RPC_METHOD_NAV_PUSH,
      params: [],
    });
  }

  public async navigationPop() {
    await this._requestManager.request({
      method: PLUGIN_RPC_METHOD_NAV_POP,
      params: [],
    });
  }

  public async didLoad() {
    await this._requestManager.request({
      method: PLUGIN_RPC_METHOD_DID_LOAD,
      params: [],
    });
  }

  async _connect(): Promise<[string, string]> {
    return await this._requestManager.request({
      method: PLUGIN_RPC_METHOD_CONNECT,
      params: [],
    });
  }

  //
  // Send a message from the plugin-ui to the host- over the reconciler bridge.
  //
  bridge(req: RpcRequest) {
    const msg = {
      type: CHANNEL_PLUGIN_REACT_RECONCILER_BRIDGE,
      detail: {
        renderId: this._nextRenderId(),
        ...req,
      },
    };
    window.parent.postMessage(msg, "*");
  }

  private _nextRenderId(): number {
    const id = this._renderId;
    this._renderId += 1;
    return id;
  }
}
