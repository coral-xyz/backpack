import {
  RpcRequest,
  RequestManager,
  Event,
  CHANNEL_PLUGIN_NOTIFICATION,
  CHANNEL_PLUGIN_RPC_REQUEST,
  CHANNEL_PLUGIN_RPC_RESPONSE,
  CHANNEL_PLUGIN_REACT_RECONCILER_BRIDGE,
  PLUGIN_NOTIFICATION_ON_CLICK,
  PLUGIN_RPC_METHOD_CONNECT,
} from "@200ms/common";

//
// Injected provider for UI plugins. Using this from a non approved plugins
// will fail.
//
export class ProviderUiInjection {
  private _renderId: number;
  private _requestManager: RequestManager;
  private _onClickFn?: (event: Event) => void;

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
        this._handleOnClick(event.data.detail);
        break;
      default:
        throw new Error("invalid notification");
    }
  }

  private _handleOnClick(event: Event) {
    if (!this._onClickFn) {
      throw new Error("click handler not found");
    }
    this._onClickFn(event);
  }

  public onClick(fn: (event: Event) => void) {
    this._onClickFn = fn;
  }

  public async connect() {
    const [publicKey, connectionUrl] = await this._connect();
    window.anchor._connect(publicKey, connectionUrl);
  }

  async _connect(): Promise<[string, string]> {
    return await this._requestManager.request({
      method: PLUGIN_RPC_METHOD_CONNECT,
      params: [],
    });
  }

  request(req: RpcRequest) {
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
