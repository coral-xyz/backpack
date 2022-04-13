import { Connection, PublicKey } from "@solana/web3.js";
import {
  Event,
  CHANNEL_PLUGIN_ON_CLICK_REQUEST,
  CHANNEL_PLUGIN_RPC_REQUEST,
  CHANNEL_PLUGIN_RPC_RESPONSE,
  CHANNEL_PLUGIN_RENDER_REQUEST,
  PLUGIN_RPC_METHOD_DID_LAUNCH,
  PLUGIN_RPC_METHOD_LAYOUT,
  PLUGIN_RPC_METHOD_WILL_APPEAR,
  CHANNEL_PLUGIN_LAUNCH_REQUEST,
} from "@200ms/common";

export type ViewType = "div" | "typography" | "image";

export interface AppContext {
  connection: Connection;
  publicKey: PublicKey;
  launchUi: (d: AppDelegate) => void;
}

export class App {
  _rootViewController: ViewController;
  _delegate: AppDelegate;

  constructor() {
    this._setupChannels();
  }

  private _setupChannels() {
    //
    // Requests from the extension UI -> Plugin.
    //
    window.addEventListener("message", async (event: Event) => {
      if (event.data.type !== CHANNEL_PLUGIN_RPC_REQUEST) return;

      const { id, method, params } = event.data.detail;

      let result: any;
      switch (method) {
        case PLUGIN_RPC_METHOD_DID_LAUNCH:
          // @ts-ignore
          window.anchor._connect(params[0], params[1]);
          this._delegate.didLaunch(this);
          result = "success";
          break;
        case PLUGIN_RPC_METHOD_WILL_APPEAR:
          this._rootViewController.viewWillAppear();
          break;
        case PLUGIN_RPC_METHOD_LAYOUT:
          this._rootViewController.layout();
          result = this._rootViewController.view.serialize();
          break;
        default:
          console.error(event);
          throw new Error("unexpected plugin method");
      }

      const resp = {
        type: CHANNEL_PLUGIN_RPC_RESPONSE,
        detail: {
          id,
          result,
          error: undefined,
        },
      };
      window.parent.postMessage(resp, "*");
    });

    //
    // On click handler requests from the extension UI -> plugin.
    //
    window.addEventListener("message", async (event: Event) => {
      if (event.data.type !== CHANNEL_PLUGIN_ON_CLICK_REQUEST) return;

      const { viewId } = event.data.detail;
      __ViewManager.didClick(viewId);
    });
  }

  launch() {
    const msg = {
      type: CHANNEL_PLUGIN_LAUNCH_REQUEST,
    };
    console.log("requesting to launch", msg);
    window.parent.postMessage(msg, "*");
  }

  setRootViewController(vc: ViewController) {
    this._rootViewController = vc;
  }

  setDelegate(appDelegate: AppDelegate) {
    this._delegate = appDelegate;
  }

  render(view: View) {
    const req = {
      type: CHANNEL_PLUGIN_RENDER_REQUEST,
      detail: {
        viewData: view.serialize(),
      },
    };
    window.parent.postMessage(req, "*");
  }
}

export interface AppDelegate {
  didLaunch(app: App): void;
}

//
// Never use this class yourself. Meant as an internal package only.
//
export class __ViewManager {
  //
  // Id for the next allocated view.
  //
  static ID: number = 0;

  //
  // Maps all view ids to the associated view. Used for click handler dispatch.
  //
  static VIEWS: Map<number, View> = new Map();

  static nextId(): number {
    const id = __ViewManager.ID;
    __ViewManager.ID += 1;
    return id;
  }

  static addView(id: number, v: View) {
    __ViewManager.VIEWS.set(id, v);
  }

  static getView(id: number): View | undefined {
    return __ViewManager.VIEWS.get(id);
  }

  static didClick(viewId: number) {
    const v = __ViewManager.getView(viewId);
    if (!v) {
      throw new Error("view not found");
    }
    v?._onClick(null);
  }
}

type ViewProps = {
  style?: any;
  children?: Array<View>;
  type?: ViewType;
  props?: any;
};

export class View {
  _id: number;
  _onClick: (event: any) => void;
  _style: any;
  _children: Array<View>;
  _type: ViewType;
  _parent?: View | ViewController;
  _props: any;

  constructor(props?: ViewProps) {
    this._style = props && props.style ? props.style : {};
    this._children = props && props.children ? props.children : [];
    this._type = props && props.type ? props.type : "div";
    this._id = __ViewManager.nextId();
    this._props = props && props.props ? props.props : {};
    __ViewManager.addView(this._id, this);
  }

  onClick(handler: (e: any) => void) {
    this._onClick = handler;
  }

  setNeedsDisplay() {
    // todo: rpc to the extension to ask for a rerender
  }

  setStyle(style: any) {
    this._style = style;
  }

  reload() {
    if (!this._parent) {
      console.error(this);
      throw new Error("parent not found");
    }
    this._parent.reload();
  }

  addSubview(child: View) {
    child._parent = this;
    this._children.push(child);
  }

  serialize() {
    return {
      id: this._id,
      type: this._type,
      style: this._style,
      children: this._children.map((c) => c.serialize()),
      props: this._props,
      onClick: undefined, // todo
    };
  }
}

export class ViewController {
  view: View;

  constructor(props) {
    this.view = new View();
    this.view._parent = this;
  }

  loadView() {
    this.view._parent = this;
  }

  viewWillAppear() {
    // no-op
  }

  viewWillLoad() {
    // no-op
  }

  viewDidLoad() {
    // no-op
  }

  reload() {
    this.layout();
    // @ts-ignore
    window.anchor._ui.render(this.view);
  }

  layout() {
    this.viewWillLoad();
    this.loadView();
    this.viewDidLoad();
  }
}

export class TableViewController extends ViewController {
  public delegate?: TableViewControllerDelegate;
  public tableView: TableView;

  constructor(props) {
    super(props);
    this.tableView = new TableView();
    this.view.addSubview(this.tableView);
  }

  loadView() {
    if (!this.delegate) {
      throw new Error("delegate required");
    }
    const rowCount = this.delegate?.rowCount();
    for (let k = 0; k < rowCount; k += 1) {
      this.tableView.addRow(this.delegate?.viewForRow(k));
    }
  }
}

class TableView extends View {
  constructor(props?: ViewProps) {
    super(props);
    this._style = {
      ...(this._style ?? {}),
      display: "flex",
      flexDirection: "column",
    };
  }

  addSubview() {
    throw new Error("use addRow instead");
  }

  addRow(v: View) {
    this._children.push(v);
  }
}

export interface TableViewControllerDelegate {
  rowCount(): number;
  viewForRow(row: number): View;
}

export class TypographyView extends View {
  constructor(props?: ViewProps) {
    super(props);
    this._type = "typography";
  }

  setText(text: string) {
    this._props.text = text;
  }
}

export class ImageView extends View {
  constructor(props) {
    super(props);
    this._type = "image";
  }

  setSrc(src: string) {
    this._props.src = src;
  }
}

export function context(): AppContext {
  // @ts-ignore
  return window.anchor;
}
