import {
  RequestManager,
  Event,
  CHANNEL_PLUGIN_NOTIFICATION,
  CHANNEL_PLUGIN_RPC_REQUEST,
  CHANNEL_PLUGIN_RPC_RESPONSE,
  CHANNEL_PLUGIN_REACT_RECONCILER_BRIDGE,
  RECONCILER_BRIDGE_METHOD_COMMIT_UPDATE,
  RECONCILER_BRIDGE_METHOD_INITIAL_RENDER,
  PLUGIN_NOTIFICATION_ON_CLICK,
  PLUGIN_RPC_METHOD_CONNECT,
} from "@200ms/common";
import { Element } from "@200ms/anchor-ui";

//
// Injected provider for UI plugins. Using this from a non approved plugins
// will fail.
//
export class ProviderUiInjection {
  private _renderId: number;
  private _requestManager: RequestManager;

  constructor() {
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
      case PLUGIN_NOTIFICATION_ON_CLICK:
        this._handleOnClick(event);
        break;
      default:
        throw new Error("invalid notification");
    }
  }

  private _handleOnClick(event: Event) {
    // todo
    console.log("handling on click event", event);
  }

  public async connect() {
    const [publicKey, connectionUrl] = await this._connect();
    // @ts-ignore
    window.anchor._connect(publicKey, connectionUrl);
  }

  async _connect(): Promise<[string, string]> {
    return await this._requestManager.request({
      method: PLUGIN_RPC_METHOD_CONNECT,
      params: [],
    });
  }

  initRender(rootChildren: Array<Element>) {
    const req = {
      type: CHANNEL_PLUGIN_REACT_RECONCILER_BRIDGE,
      detail: {
        renderId: this._nextRenderId(),
        method: RECONCILER_BRIDGE_METHOD_INITIAL_RENDER,
        params: [rootChildren],
      },
    };
    window.parent.postMessage(req, "*");
  }

  updateDom(instance: Element) {
    const req = {
      type: CHANNEL_PLUGIN_REACT_RECONCILER_BRIDGE,
      detail: {
        renderId: this._nextRenderId(),
        method: RECONCILER_BRIDGE_METHOD_COMMIT_UPDATE,
        params: [instance],
      },
    };
    window.parent.postMessage(req, "*");
  }

  private _nextRenderId(): number {
    const id = this._renderId;
    this._renderId += 1;
    return id;
  }
}
