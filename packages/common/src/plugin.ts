import type { ConfirmOptions, SendOptions } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import base32Encode from "base32-encode";
import base58 from "bs58";

import { openPopupWindow } from "./browser/extension";
import type { BackgroundClient } from "./channel/app-ui";
import { PluginServer } from "./channel/plugin";
import {
  CHANNEL_PLUGIN_NOTIFICATION,
  CHANNEL_PLUGIN_RPC_REQUEST,
  CHANNEL_PLUGIN_RPC_RESPONSE,
  ETHEREUM_RPC_METHOD_SIGN_AND_SEND_TX as PLUGIN_ETHEREUM_RPC_METHOD_SIGN_AND_SEND_TX,
  ETHEREUM_RPC_METHOD_SIGN_MESSAGE as PLUGIN_ETHEREUM_RPC_METHOD_SIGN_MESSAGE,
  ETHEREUM_RPC_METHOD_SIGN_TX as PLUGIN_ETHEREUM_RPC_METHOD_SIGN_TX,
  PLUGIN_NOTIFICATION_CONNECT,
  PLUGIN_NOTIFICATION_ETHEREUM_CONNECTION_URL_UPDATED,
  PLUGIN_NOTIFICATION_ETHEREUM_PUBLIC_KEY_UPDATED,
  PLUGIN_NOTIFICATION_MOUNT,
  PLUGIN_NOTIFICATION_SOLANA_CONNECTION_URL_UPDATED,
  PLUGIN_NOTIFICATION_SOLANA_PUBLIC_KEY_UPDATED,
  PLUGIN_NOTIFICATION_UNMOUNT,
  PLUGIN_NOTIFICATION_UPDATE_METADATA,
  PLUGIN_REQUEST_ETHEREUM_SIGN_AND_SEND_TRANSACTION,
  PLUGIN_REQUEST_ETHEREUM_SIGN_MESSAGE,
  PLUGIN_REQUEST_ETHEREUM_SIGN_TRANSACTION,
  PLUGIN_REQUEST_SOLANA_SIGN_ALL_TRANSACTIONS,
  PLUGIN_REQUEST_SOLANA_SIGN_AND_SEND_TRANSACTION,
  PLUGIN_REQUEST_SOLANA_SIGN_MESSAGE,
  PLUGIN_REQUEST_SOLANA_SIGN_TRANSACTION,
  PLUGIN_RPC_METHOD_LOCAL_STORAGE_GET,
  PLUGIN_RPC_METHOD_LOCAL_STORAGE_PUT,
  PLUGIN_RPC_METHOD_PLUGIN_OPEN,
  PLUGIN_RPC_METHOD_POP_OUT,
  PLUGIN_RPC_METHOD_WINDOW_OPEN,
  SOLANA_RPC_METHOD_SIGN_ALL_TXS as PLUGIN_SOLANA_RPC_METHOD_SIGN_ALL_TXS,
  SOLANA_RPC_METHOD_SIGN_AND_SEND_TX as PLUGIN_SOLANA_RPC_METHOD_SIGN_AND_SEND_TX,
  SOLANA_RPC_METHOD_SIGN_MESSAGE as PLUGIN_SOLANA_RPC_METHOD_SIGN_MESSAGE,
  SOLANA_RPC_METHOD_SIGN_TX as PLUGIN_SOLANA_RPC_METHOD_SIGN_TX,
  SOLANA_RPC_METHOD_SIMULATE as PLUGIN_SOLANA_RPC_METHOD_SIMULATE_TX,
  UI_RPC_METHOD_PLUGIN_LOCAL_STORAGE_GET,
  UI_RPC_METHOD_PLUGIN_LOCAL_STORAGE_PUT,
} from "./constants";
import { getLogger } from "./logging";
import type { Event, RpcResponse, XnftMetadata, XnftPreference } from "./types";
import { Blockchain } from "./types";
import { externalResourceUri } from "./utils";

const logger = getLogger("common/plugin");

//
// A plugin is a react bundle served from a given URL, using the Backpack
// framework + protocol to render its views inside the native wallet interface.
//
// This class is effectively the model. To display a plugin, create one of
// these objects and then pass it into the renderer component.
//
export class Plugin {
  private _activeWallets: { [blockchain: string]: string };
  private _connectionUrls: { [blockchain: string]: string | null };
  private _rpcServer: PluginServer;
  public iframeRoot?: HTMLIFrameElement;
  private _iframeActive?: HTMLIFrameElement;

  public didFinishSetup?: Promise<void>;
  private _didFinishSetupResolver?: () => void;

  //
  // Host APIs.
  //
  private _navPushFn?: (args: any) => void;
  private _requestTxApprovalFn?: (request: any) => void;
  private _backgroundClient?: BackgroundClient;
  private _connectionBackgroundClient?: BackgroundClient;
  private _openPlugin?: (xnftAddress: string) => void;

  //
  // The last time a click event was handled for the plugin. This is used as an
  // approximation to ensure the trusted transaction signing view can only be
  // displayed in the context of a click handler.
  //
  private _lastClickTsMs?: number;

  readonly iframeRootUrl: string;
  readonly iconUrl: string;
  readonly splashUrls: { src: string; height: number; width: number }[];
  readonly title: string;
  readonly xnftAddress: PublicKey;
  readonly xnftInstallAddress: PublicKey;

  constructor(
    xnftAddress: PublicKey | string,
    xnftInstallAddress: PublicKey | string,
    url: string,
    iconUrl: string,
    splashUrls: { src: string; height: number; width: number }[],
    title: string,
    activeWallets: { [blockchain: string]: string },
    connectionUrls: { [blockchain: string]: string | null }
  ) {
    //
    // Provide connection for the plugin.
    //

    this._activeWallets = activeWallets;
    this._connectionUrls = connectionUrls;
    this.title = title;
    this.iconUrl = iconUrl;
    this.splashUrls = splashUrls;
    this.xnftAddress = new PublicKey(xnftAddress);
    this.xnftInstallAddress = new PublicKey(xnftInstallAddress);

    const xnftAddressB32 = base32Encode(
      base58.decode(this.xnftAddress.toBase58()),
      "RFC4648",
      { padding: false }
    );

    const iframeRootUrl =
      url.startsWith("ar://") || url.startsWith("ipfs://")
        ? //  || this.xnftAddress.toBase58() ===
          //   "CkqWjTWzRMAtYN3CSs8Gp4K9H891htmaN1ysNXqcULc8"
          `https://${xnftAddressB32}.gateway.xnfts.dev`
        : externalResourceUri(url);

    const whitelistedProtocols = ["ar://", "ipfs://", "https://", "http://"];
    const isWhitelisted = whitelistedProtocols.find((p) =>
      iframeRootUrl.startsWith(p)
    );
    if (!isWhitelisted) {
      throw new Error("invalid xnft url");
    }

    this.iframeRootUrl = iframeRootUrl;

    //
    // RPC Server channel from plugin -> extension-ui.
    //
    this._rpcServer = new PluginServer(
      url,
      CHANNEL_PLUGIN_RPC_REQUEST,
      CHANNEL_PLUGIN_RPC_RESPONSE
    );

    //
    // Effectively take a lock that's held until the setup is complete.
    //
    this.didFinishSetup = new Promise((resolve) => {
      this._didFinishSetupResolver = resolve;
    });
  }

  public get needsLoad() {
    return this._navPushFn === undefined;
  }

  //
  // Loads the plugin javascript code inside the iframe.
  //
  public createIframe(
    preference: XnftPreference | null,
    deepXnftPath?: string
  ) {
    logger.debug("creating iframe element");
    const url = new URL(this.iframeRootUrl);
    if (deepXnftPath) {
      // url.searchParams.set("deepXnftPath", deepXnftPath);
      url.hash = deepXnftPath;
    }
    this.iframeRoot = document.createElement("iframe");
    this.iframeRoot.style.width = "100%";
    this.iframeRoot.style.height = "100vh";
    this.iframeRoot.style.border = "none";
    this.iframeRoot.setAttribute(
      "allow",
      preference?.mediaPermissions
        ? "camera;microphone;display-capture;fullscreen;clipboard-write *"
        : "fullscreen;clipboard-write *"
    );
    this.iframeRoot.setAttribute("fetchpriority", "low");
    this.iframeRoot.src = url.toString();
    this.iframeRoot.sandbox.add("allow-same-origin");
    this.iframeRoot.sandbox.add("allow-scripts");
    this.iframeRoot.sandbox.add("allow-forms");

    this.iframeRoot.onload = () => this.handleRootIframeOnLoad();
  }

  // Onload handler for the top level iframe representing the xNFT.
  private handleRootIframeOnLoad() {
    logger.debug("iframe on load");

    //
    // Context switch to this iframe.
    //
    this.setActiveIframe(this.iframeRoot!, this.iframeRootUrl);

    //
    // Done.
    //
    this._didFinishSetupResolver!();
  }

  // Note: Each time this is called, the previous active iframe no longer
  //       has the ability to make rpc invocations. Furthermore, the state
  //       will become stale, e.g., window.xnft.publicKey will be incorrect
  //       for the old active iframe since it will not receive the wallet
  //       changed notification.
  //
  //       In the future, we should properly cleanup the state for old iframes
  //       e.g., push down a disconnect event and/or provide the ability
  //       for multiple iframes within a single xNFT to have an active
  //       connection to the host at once.
  //
  //       For now, we make the simplifying assumption that if this is called
  //       it's meant for the iframe to fully hijack the xnft context.
  //
  public setActiveIframe(iframe: HTMLIFrameElement, xnftUrl: string) {
    this._iframeActive = iframe;

    this._rpcServer.setWindow(
      iframe.contentWindow,
      xnftUrl,
      this._handleRpc.bind(this)
    );
    this.pushConnectNotification();
  }

  //
  // Cleanup the plugin iframe and garbage collect all associated data.
  //
  public destroyIframe() {
    logger.debug("destroying iframe element");

    // document.head.removeChild(this.iframeRoot!);
    this.iframeRoot = undefined;
    // Don't need to remove the active iframe because we've removed the root.
    this._iframeActive = undefined;
    this._rpcServer.destroyWindow();
    this._didFinishSetupResolver = undefined;
    this.didFinishSetup = undefined;
  }

  //
  // Apis set from the outside host.
  //
  public setHostApi({
    push,
    pop,
    request,
    backgroundClient,
    connectionBackgroundClient,
    openPlugin,
  }: any) {
    this._navPushFn = push;
    this._openPlugin = openPlugin;
    this._requestTxApprovalFn = request;
    this._backgroundClient = backgroundClient;
    this._connectionBackgroundClient = connectionBackgroundClient;
  }

  //////////////////////////////////////////////////////////////////////////////
  // Rendering.
  //////////////////////////////////////////////////////////////////////////////

  public mount(preference: XnftPreference | null, deepXnftPath: string) {
    this.createIframe(preference, deepXnftPath);
    this.didFinishSetup!.then(() => {
      this.pushMountNotification();
    });
  }

  public unmount() {
    this.destroyIframe();
    this.pushUnmountNotification();

    //
    // Effectively take a lock that's held until the setup is complete.
    //
    this.didFinishSetup = new Promise((resolve) => {
      this._didFinishSetupResolver = resolve;
    });
  }

  public pushMountNotification() {
    const event = {
      type: CHANNEL_PLUGIN_NOTIFICATION,
      detail: {
        name: PLUGIN_NOTIFICATION_MOUNT,
        data: {},
      },
    };
    this.iframeRoot?.contentWindow?.postMessage(event, "*");
  }

  public pushAppUiMetadata(metadata: XnftMetadata) {
    const event = {
      type: CHANNEL_PLUGIN_NOTIFICATION,
      detail: {
        name: PLUGIN_NOTIFICATION_UPDATE_METADATA,
        data: { metadata },
      },
    };
    this.iframeRoot?.contentWindow?.postMessage(event, "*");
  }

  public pushUnmountNotification() {
    const event = {
      type: CHANNEL_PLUGIN_NOTIFICATION,
      detail: {
        name: PLUGIN_NOTIFICATION_UNMOUNT,
        data: {},
      },
    };
    this.iframeRoot?.contentWindow?.postMessage(event, "*");
  }

  public pushConnectNotification() {
    const event = {
      type: CHANNEL_PLUGIN_NOTIFICATION,
      detail: {
        name: PLUGIN_NOTIFICATION_CONNECT,
        data: {
          publicKeys: this._activeWallets,
          connectionUrls: this._connectionUrls,
        },
      },
    };
    this._iframeActive?.contentWindow!.postMessage(event, "*");
  }

  public pushSolanaConnectionChangedNotification(url: string) {
    this._connectionUrls = {
      ...this._connectionUrls,
      [Blockchain.SOLANA]: url,
    };
    if (this._iframeActive) {
      const event = {
        type: CHANNEL_PLUGIN_NOTIFICATION,
        detail: {
          name: PLUGIN_NOTIFICATION_SOLANA_CONNECTION_URL_UPDATED,
          data: {
            url,
          },
        },
      };
      this._iframeActive?.contentWindow!.postMessage(event, "*");
    }
  }

  public pushSolanaPublicKeyChangedNotification(publicKey: string) {
    this._activeWallets = {
      ...this._activeWallets,
      [Blockchain.SOLANA]: publicKey,
    };
    if (this._iframeActive) {
      const event = {
        type: CHANNEL_PLUGIN_NOTIFICATION,
        detail: {
          name: PLUGIN_NOTIFICATION_SOLANA_PUBLIC_KEY_UPDATED,
          data: {
            publicKey,
          },
        },
      };
      this._iframeActive?.contentWindow!.postMessage(event, "*");
    }
  }

  public pushEthereumConnectionChangedNotification(url: string) {
    this._connectionUrls = {
      ...this._connectionUrls,
      [Blockchain.ETHEREUM]: url,
    };
    if (this._iframeActive) {
      const event = {
        type: CHANNEL_PLUGIN_NOTIFICATION,
        detail: {
          name: PLUGIN_NOTIFICATION_ETHEREUM_CONNECTION_URL_UPDATED,
          data: {
            url,
          },
        },
      };
      this._iframeActive?.contentWindow!.postMessage(event, "*");
    }
  }

  public pushEthereumPublicKeyChangedNotification(publicKey: string) {
    this._activeWallets = {
      ...this._activeWallets,
      [Blockchain.ETHEREUM]: publicKey,
    };
    if (this._iframeActive) {
      const event = {
        type: CHANNEL_PLUGIN_NOTIFICATION,
        detail: {
          name: PLUGIN_NOTIFICATION_ETHEREUM_PUBLIC_KEY_UPDATED,
          data: {
            publicKey,
          },
        },
      };
      this._iframeActive?.contentWindow!.postMessage(event, "*");
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // RPC Requests.
  //////////////////////////////////////////////////////////////////////////////

  private async _handleRpc(event: Event): Promise<RpcResponse> {
    const req = event.data.detail;
    logger.debug(`plugin rpc: ${JSON.stringify(req)}`);

    const { method, params } = req;
    switch (method) {
      case PLUGIN_RPC_METHOD_LOCAL_STORAGE_GET:
        return await this._handleGet(params[0]);
      case PLUGIN_RPC_METHOD_LOCAL_STORAGE_PUT:
        return await this._handlePut(params[0], params[1]);
      case PLUGIN_RPC_METHOD_WINDOW_OPEN:
        return await this._handleWindowOpen(params[0]);
      case PLUGIN_RPC_METHOD_PLUGIN_OPEN:
        return await this._handlePluginOpen(params[0]);
      case PLUGIN_RPC_METHOD_POP_OUT:
        return await this._handlePopout(params[0]);
      case PLUGIN_ETHEREUM_RPC_METHOD_SIGN_TX:
        return await this._handleEthereumSignTransaction(params[0], params[1]);
      case PLUGIN_ETHEREUM_RPC_METHOD_SIGN_AND_SEND_TX:
        return await this._handleEthereumSignAndSendTransaction(
          params[0],
          params[1]
        );
      case PLUGIN_ETHEREUM_RPC_METHOD_SIGN_MESSAGE:
        return await this._handleEthereumSignMessage(params[0], params[1]);
      case PLUGIN_SOLANA_RPC_METHOD_SIGN_TX:
        return await this._handleSolanaSignTransaction(params[0], params[1]);
      case PLUGIN_SOLANA_RPC_METHOD_SIGN_ALL_TXS:
        return await this._handleSolanaSignAllTransactions(
          params[0],
          params[1]
        );
      case PLUGIN_SOLANA_RPC_METHOD_SIGN_AND_SEND_TX:
        return await this._handleSolanaSignAndSendTransaction(
          params[0],
          params[1],
          params[2],
          params[3]
        );
      case PLUGIN_SOLANA_RPC_METHOD_SIGN_MESSAGE:
        return await this._handleSolanaSignMessage(params[0], params[1]);
      case PLUGIN_SOLANA_RPC_METHOD_SIMULATE_TX:
        return await this._handleSolanaSimulate(params[0], params[1]);
      default:
        logger.error(method);
        throw new Error("unexpected method");
    }
  }

  private async _handleEthereumSignTransaction(
    transaction: string,
    pubkey: string
  ): Promise<RpcResponse> {
    try {
      const signature = await this._requestTransactionApproval(
        PLUGIN_REQUEST_ETHEREUM_SIGN_TRANSACTION,
        transaction,
        pubkey
      );
      return [signature];
    } catch (err: any) {
      return [null, err.toString()];
    }
  }

  private async _handleEthereumSignAndSendTransaction(
    transaction: string,
    pubkey: string
  ): Promise<RpcResponse> {
    try {
      const signature = await this._requestTransactionApproval(
        PLUGIN_REQUEST_ETHEREUM_SIGN_AND_SEND_TRANSACTION,
        transaction,
        pubkey
      );
      return [signature];
    } catch (err: any) {
      return [null, err.toString()];
    }
  }

  private async _handleEthereumSignMessage(
    transaction: string,
    pubkey: string
  ): Promise<RpcResponse> {
    try {
      const signature = await this._requestTransactionApproval(
        PLUGIN_REQUEST_ETHEREUM_SIGN_MESSAGE,
        transaction,
        pubkey
      );
      return [signature];
    } catch (err: any) {
      return [null, err.toString()];
    }
  }

  private async _handleSolanaSignTransaction(
    transaction: string,
    pubkey: string
  ): Promise<RpcResponse> {
    try {
      const signature = await this._requestTransactionApproval(
        PLUGIN_REQUEST_SOLANA_SIGN_TRANSACTION,
        transaction,
        pubkey
      );
      return [signature];
    } catch (err: any) {
      return [null, err.toString()];
    }
  }

  private async _handleSolanaSignAllTransactions(
    transactions: Array<string>,
    pubkey: string
  ): Promise<RpcResponse> {
    try {
      const signature = await this._requestTransactionApproval(
        PLUGIN_REQUEST_SOLANA_SIGN_ALL_TRANSACTIONS,
        transactions,
        pubkey
      );
      return [signature];
    } catch (err: any) {
      return [null, err.toString()];
    }
  }

  private async _handleSolanaSignAndSendTransaction(
    transaction: string,
    pubkey: string,
    options: SendOptions | ConfirmOptions,
    confirmTransaction: boolean
  ): Promise<RpcResponse> {
    try {
      const signature = await this._requestTransactionApproval(
        PLUGIN_REQUEST_SOLANA_SIGN_AND_SEND_TRANSACTION,
        transaction,
        pubkey,
        options,
        confirmTransaction
      );
      return [signature];
    } catch (err: any) {
      return [null, err.toString()];
    }
  }

  private async _handleSolanaSignMessage(
    msg: string,
    pubkey: string
  ): Promise<RpcResponse> {
    try {
      const signature = await this._requestTransactionApproval(
        PLUGIN_REQUEST_SOLANA_SIGN_MESSAGE,
        msg,
        pubkey
      );
      return [signature];
    } catch (err: any) {
      return [null, err.toString()];
    }
  }

  private async _handleSolanaSimulate(
    transaction: string,
    pubkey: string
  ): Promise<RpcResponse> {
    // todo
    return ["success"];
  }

  private async _handleGet(key: string): Promise<RpcResponse> {
    const resp = await this._backgroundClient?.request({
      method: UI_RPC_METHOD_PLUGIN_LOCAL_STORAGE_GET,
      params: [this.xnftAddress.toString(), key],
    });
    return [resp];
  }

  private async _handlePut(key: string, value: any): Promise<RpcResponse> {
    const resp = await this._backgroundClient?.request({
      method: UI_RPC_METHOD_PLUGIN_LOCAL_STORAGE_PUT,
      params: [this.xnftAddress.toString(), key, value],
    });
    return [resp];
  }

  private async _handlePopout(fullscreen: boolean): Promise<RpcResponse> {
    if (fullscreen) {
      window.open("popup.html", "_blank");
    } else {
      await openPopupWindow("popup.html");
      window.close();
    }
    return ["success"];
  }

  private async _handleWindowOpen(url: string): Promise<RpcResponse> {
    window.open(url, "_blank");
    return ["success"];
  }

  private async _handlePluginOpen(nftAddress: string): Promise<RpcResponse> {
    console.log("open", nftAddress, this._openPlugin);
    this._openPlugin?.(nftAddress);
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
    transaction: string | string[],
    publicKey: string,
    options?: SendOptions | ConfirmOptions,
    confirmTransaction?: boolean
  ): Promise<string | null> {
    return new Promise<string | null>((resolve, reject) => {
      this._requestTxApprovalFn!({
        kind,
        data: transaction,
        xnftAddress: this.xnftAddress,
        pluginUrl: this.iframeRootUrl,
        publicKey,
        resolve,
        reject,
        confirmTransaction,
        options,
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
    return await this._connectionBackgroundClient?.request(event.data.detail);
  }
}
