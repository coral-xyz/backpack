import { useMemo, useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useTheme, makeStyles, Typography } from "@material-ui/core";
import { debug } from "@200ms/common";
import {
  NOTIFICATION_CONNECTED,
  CHANNEL_PLUGIN_RPC_RESPONSE,
  CHANNEL_PLUGIN_RPC_REQUEST,
  CHANNEL_PLUGIN_RENDER_REQUEST,
  CHANNEL_PLUGIN_LAUNCH_REQUEST,
  PLUGIN_RPC_METHOD_LAYOUT,
  PLUGIN_RPC_METHOD_WILL_APPEAR,
  PLUGIN_RPC_METHOD_DID_LAUNCH,
} from "../../../common";
import { usePlugins } from "../../../hooks/usePlugins";

const useStyles = makeStyles((theme: any) => ({
  pluginView: {
    marginBottom: "5px",
  },
}));

export function Plugins() {
  const plugins = usePlugins();
  return (
    <div>
      {plugins.map((p: any) => (
        <PluginView key={p.iframeUrl} plugin={p} />
      ))}
    </div>
  );
}

function PluginView({ plugin }: any) {
  const classes = useStyles();
  const [viewData, setViewData] = useState<null | any>(null);

  // Force rerender the view whenever the plugin asks for it.
  useEffect(() => {
    plugin.onRender((viewData: any) => {
      // TODO: only the view with the given id should be rerendered!
      setViewData(viewData);
    });
  }, []);

  return (
    <div className={classes.pluginView}>
      {viewData && <ViewRenderer viewData={viewData} />}
    </div>
  );
}

function ViewRenderer({ viewData }: any) {
  const { props, style, children, type } = viewData;
  switch (type) {
    case "div":
      return <DivView props={props} style={style} children={children} />;
    case "typography":
      return <TypographyView props={props} style={style} />;
    case "image":
      return <ImageView props={props} style={style} />;
    default:
      console.error(viewData);
      throw new Error("unexpected view data");
  }
}

function DivView({ props, style, children }: any) {
  return (
    <div>
      {children.map((c: any) => (
        <ViewRenderer key={c.id} viewData={c} />
      ))}
    </div>
  );
}

function TypographyView({ props, style }: any) {
  const theme = useTheme() as any;
  style = {
    color: theme.custom.colors.fontColor,
    fontWeight: 500,
    ...style,
  };
  return <Typography style={style}>{props.text}</Typography>;
}

function ImageView({ props, style }: any) {
  return <img src={props.src} style={style} />;
}

export class Plugin {
  private activeWallet: PublicKey;
  private connectionUrl: string;
  public requestId: number;
  private responseResolvers: { [reqId: number]: [Function, Function] };
  private iframe: any;
  private iframeUrl: string;
  public _renderFn: (data: any) => void;

  constructor(url: string, activeWallet: PublicKey, connectionUrl: string) {
    this.activeWallet = activeWallet;
    this.connectionUrl = connectionUrl;

    this.requestId = 0;
    this.responseResolvers = {};
    this._setupResponseChannel();
    this._renderFn = (_data: any) => {};

    this.iframeUrl = url;
    this.iframe = document.createElement("iframe");
    this.iframe.src = this.iframeUrl;
    this.iframe.allow = `'src'`;
    document.head.appendChild(this.iframe);
  }

  private async launch() {
    await this.didLaunch();
    await this.viewWillAppear();
    await this.viewLayout();
  }

  private async viewWillAppear() {
    debug("laying out views");
    const viewData = await this.request({
      method: PLUGIN_RPC_METHOD_WILL_APPEAR,
      params: [],
    });
    this._renderFn(viewData);
  }

  private async viewLayout() {
    debug("laying out views");
    const viewData = await this.request({
      method: PLUGIN_RPC_METHOD_LAYOUT,
      params: [],
    });
    this._renderFn(viewData);
  }

  async didLaunch() {
    debug("did launch plugin");
    await this.request({
      method: PLUGIN_RPC_METHOD_DID_LAUNCH,
      params: [this.activeWallet.toString(), this.connectionUrl],
    });
  }

  onRender(fn: (data: any) => void) {
    this._renderFn = fn;
  }

  _setupResponseChannel() {
    //
    // Handles all responses from the plugin (after we've made a request).
    //
    window.addEventListener("message", (event) => {
      if (event.data.type !== CHANNEL_PLUGIN_RPC_RESPONSE) {
        return;
      }
      const { id, result, error } = event.data.detail;
      const resolver = this.responseResolvers[id];
      if (!resolver) {
        // Why does this get thrown?
        //        throw new Error(`resolver not found for request id: ${id}`);
        return;
      }
      const [resolve, reject] = resolver;
      delete this.responseResolvers[id];
      if (error) {
        reject(error);
      }
      resolve(result);
    });

    //
    // Handles requests from the plugin to rerender the view.
    //
    window.addEventListener("message", (event) => {
      if (event.data.type !== CHANNEL_PLUGIN_RENDER_REQUEST) {
        return;
      }
      if (event.origin !== this.iframeUrl) {
        // TODO: check origin.
      }
      const { viewData } = event.data.detail;
      this._renderFn(viewData);
    });

    window.addEventListener("message", (event) => {
      if (event.data.type !== CHANNEL_PLUGIN_LAUNCH_REQUEST) {
        return;
      }
      this.launch();
    });
  }

  private async request<T = any>(req: {
    method: string;
    params: Array<any>;
  }): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = this.nextRequestId();
      this.responseResolvers[id] = [resolve, reject];
      const msg = {
        type: CHANNEL_PLUGIN_RPC_REQUEST,
        detail: {
          id,
          ...req,
        },
      };
      this.iframe.contentWindow.postMessage(msg, "*");
    });
  }

  private nextRequestId(): number {
    const id = this.requestId;
    this.requestId += 1;
    return id;
  }
}
