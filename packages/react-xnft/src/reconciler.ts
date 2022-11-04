import ReactReconciler, { HostConfig, OpaqueHandle } from "react-reconciler";
import { EventEmitter } from "eventemitter3";
import { ReactDom } from "./ReactDom";
import { getLogger, Event } from "@coral-xyz/common-public";
import { NAV_STACK } from "./Context";
import { CONNECT, ETHEREUM_CONNECT, SOLANA_CONNECT } from "./EVENTS";

const logger = getLogger("react-xnft/reconciler");
const events = new EventEmitter();

export const ReactXnft = {
  events,
  render(reactNode: any) {
    window.addEventListener("load", () => {
      window.xnft.on("connect", () => {
        logger.debug("connect");
        NAV_STACK.push(reactNode);
        events.emit(CONNECT);
      });

      window.xnft.solana.on("connect", () => {
        events.emit(SOLANA_CONNECT);
      });

      window.xnft.ethereum.on("connect", () => {
        events.emit(ETHEREUM_CONNECT);
      });

      window.xnft.on("mount", () => {
        logger.debug("mount");
        const node = NAV_STACK[NAV_STACK.length - 1];
        reconcilerRender(node);
      });

      window.xnft.on("unmount", () => {
        logger.debug("unmount");
      });

      window.xnft.on("pop", () => {
        logger.debug("pop");
        NAV_STACK.pop();
      });
    });
  },
  renderWidget(reactNode: any) {},
};

//
// Renders the dom in the hosted environment.
//
export function reconcilerRender(reactNode: any) {
  const cb = () => {};
  const root: RootContainer = {
    host: HOST,
    children: [],
  };
  const container = RECONCILER.createContainer(root, false, false);
  RECONCILER.updateContainer(reactNode, container, null, cb);
}

const RECONCILER = ReactReconciler({
  isPrimaryRenderer: true,
  supportsMutation: true,
  supportsHydration: false,
  supportsPersistence: false,

  now: Date.now,
  noTimeout: -1,

  //
  // Host context configuration.
  //
  getRootHostContext: (root: RootContainer): Host => {
    logger.debug("getRootHostContext");
    return root.host;
  },
  getChildHostContext: (
    parentHost: Host,
    kind: NodeKind,
    root: RootContainer
  ): Host => {
    logger.debug("getChildHostContext");
    return parentHost;
  },

  //
  // Create serialized nodes.
  //
  createInstance: (
    kind: NodeKind | string,
    props: NodeProps,
    r: RootContainer,
    h: Host,
    o: OpaqueHandle
  ): NodeSerialized => {
    logger.debug("createInstance", kind, props);
    switch (kind) {
      case NodeKind.View:
        return createViewInstance(kind, props, r, h, o);
      case NodeKind.Table:
        return createTableInstance(kind, props, r, h, o);
      case NodeKind.TableRow:
        return createTableRowInstance(kind, props, r, h, o);
      case NodeKind.Text:
        return createTextLabelInstance(kind, props, r, h, o);
      case NodeKind.TextField:
        return createTextFieldInstance(kind, props, r, h, o);
      case NodeKind.Image:
        return createImageInstance(kind, props, r, h, o);
      case NodeKind.Button:
        return createButtonInstance(kind, props, r, h, o);
      case NodeKind.Loading:
        return createLoadingInstance(kind, props, r, h, o);
      case NodeKind.Audio:
        return createAudioInstance(kind, props, r, h, o);
      case NodeKind.Video:
        return createVideoInstance(kind, props, r, h, o);
      case NodeKind.ScrollBar:
        return createScrollBarInstance(kind, props, r, h, o);
      case NodeKind.Svg:
        return createSvgInstance(kind, props, r, h, o);
      case NodeKind.Path:
        return createPathInstance(kind, props, r, h, o);
      case NodeKind.Circle:
        return createCircleInstance(kind, props, r, h, o);
      case NodeKind.Iframe:
        return createIframeInstance(kind, props, r, h, o);
      case NodeKind.NavAnimation:
        return createNavAnimationInstance(kind, props, r, h, o);
      case NodeKind.BalancesTable:
        return createBalancesTableInstance(kind, props, r, h, o);
      case NodeKind.BalancesTableHead:
        return createBalancesTableHeadInstance(kind, props, r, h, o);
      case NodeKind.BalancesTableContent:
        return createBalancesTableContentInstance(kind, props, r, h, o);
      case NodeKind.BalancesTableRow:
        return createBalancesTableRowInstance(kind, props, r, h, o);
      case NodeKind.BalancesTableCell:
        return createBalancesTableCellInstance(kind, props, r, h, o);
      case NodeKind.BalancesTableFooter:
        return createBalancesTableFooterInstance(kind, props, r, h, o);
      case NodeKind.Custom:
        if (!props.component) {
          throw new Error("Component not found in Custom Node");
        }
        return createCustomInstance(kind, props, r, h, o);
      default:
        throw new Error(
          `Component ${kind} is not part of the ReactXnft library, please use the available set of components.`
        );
    }
  },
  createTextInstance: (
    text: string,
    _r: RootContainer,
    h: Host,
    _o: OpaqueHandle
  ): TextSerialized => {
    logger.debug("createTextInstance", text);
    const instance = {
      id: h.nextId(),
      kind: "raw" as const,
      text,
      props: undefined,
      style: undefined,
    };
    return instance;
  },
  appendInitialChild: (parent: NodeSerialized, child: Element) => {
    logger.debug("appendInitialChild", parent, child);
    parent.children.push(child);
  },

  //
  // Render phase.
  //
  prepareUpdate: (
    instance: NodeSerialized,
    type: NodeKind,
    oldProps: NodeProps,
    newProps: NodeProps,
    root: RootContainer,
    host: Host
  ): UpdateDiff => {
    logger.debug("prepareUpdate", instance, type, oldProps, newProps);
    return {
      props: newProps,
    };
  },
  finalizeInitialChildren: (
    _parent: NodeSerialized,
    _kind: NodeKind,
    _props: NodeProps,
    _root: RootContainer,
    _host: Host
  ): boolean => {
    logger.debug(
      "finalizeInitialChildren",
      _parent,
      _kind,
      _props,
      _root,
      _host
    );
    return false;
  },

  //
  // Commit phase.
  //
  prepareForCommit: (_c: RootContainer) => {
    logger.debug("prepareForCommit", _c);
    return null;
  },
  commitUpdate: (
    instance: NodeSerialized,
    updatePayload: UpdateDiff,
    type: NodeKind,
    oldProps: NodeProps,
    newProps: NodeProps,
    internalInstanceHandle: OpaqueHandle
  ) => {
    logger.debug(
      "commitUpdate",
      instance,
      type,
      updatePayload,
      oldProps,
      newProps
    );

    //
    // If there's no update payload, then don't rerender!
    //
    if (updatePayload === null || Object.keys(updatePayload).length === 0) {
      return;
    }

    instance.props = updatePayload.props;

    ReactDom.getInstance().commitUpdate(instance.id, updatePayload);
  },
  commitTextUpdate: (
    textInstance: TextSerialized,
    oldText: string,
    nextText: string
  ) => {
    logger.debug("commitTextUpdate");
    textInstance.text = nextText;

    ReactDom.getInstance().commitTextUpdate(textInstance.id, nextText);
  },
  appendChildToContainer: (c: RootContainer, child: Element) => {
    logger.debug("appendChildToContainer", c, child);

    ReactDom.getInstance().appendChildToContainer(child);
  },
  appendChild: (parent: NodeSerialized, child: Element) => {
    logger.debug("appendChild", parent, child);

    ReactDom.getInstance().appendChild(parent.id, child);
  },
  insertInContainerBefore: (
    root: RootContainer,
    child: Element,
    before: Element
  ) => {
    logger.debug("insertInContainerBefore");
    ReactDom.getInstance().insertInContainerBefore(child, before.id);
  },
  insertBefore: (parent: NodeSerialized, child: Element, before: Element) => {
    logger.debug("insertBefore");
    ReactDom.getInstance().insertBefore(parent.id, child, before.id);
  },
  removeChild: (parent: NodeSerialized, child: Element) => {
    logger.debug("removeChild", parent, child);
    ReactDom.getInstance().removeChild(parent.id, child.id);
  },
  removeChildFromContainer: (root: RootContainer, child: Element) => {
    logger.debug("removeChildFromContainer", root, child);
    ReactDom.getInstance().removeChildFromContainer(child.id);
  },

  //
  // Misc.
  //
  getPublicInstance: (instance: Element) => {
    logger.debug("getPublicInstance");
    return instance;
  },
  shouldSetTextContent: () => {
    logger.debug("shouldSetTextContent");
    return false;
  },
  resetAfterCommit: (root: RootContainer) => {
    logger.debug("resetAfterCommit", root);
  },
  clearContainer: (root: RootContainer) => {
    logger.debug("clearContainer", root);
    root.children = [];
  },
  shouldDeleteUnhydratedTailInstances: () => {
    logger.debug("shouldDeleteUnhydratedTailInstances");
  },
  scheduleTimeout: (fn: () => void, delay: number) => {
    logger.debug("scheduleTimeout");
    return setTimeout(fn, delay);
  },
});

function createViewInstance(
  _kind: NodeKind,
  props: ViewProps,
  _r: RootContainer,
  h: Host,
  _o: OpaqueHandle
): ViewNodeSerialized {
  const id = h.nextId();
  return {
    id,
    kind: NodeKind.View,
    props: {
      ...props,
      children: undefined,
    },
    children: [],
  };
}

function createTableInstance(
  _kind: NodeKind,
  props: NodeProps,
  _r: RootContainer,
  h: Host,
  _o: OpaqueHandle
): TableNodeSerialized {
  return {
    id: h.nextId(),
    kind: NodeKind.Table,
    props: {
      ...props,
      children: undefined,
    },
    children: [],
  };
}

function createTableRowInstance(
  _kind: NodeKind,
  props: NodeProps,
  _r: RootContainer,
  h: Host,
  _o: OpaqueHandle
): TableRowNodeSerialized {
  return {
    id: h.nextId(),
    kind: NodeKind.TableRow,
    props: {
      ...props,
      children: undefined,
    },
    children: [],
  };
}

function createTextLabelInstance(
  _kind: NodeKind,
  props: NodeProps,
  _r: RootContainer,
  h: Host,
  _o: OpaqueHandle
): TextNodeSerialized {
  return {
    id: h.nextId(),
    kind: NodeKind.Text,
    props: {
      ...props,
      children: undefined,
    },
    children: [],
  };
}

function createTextFieldInstance(
  _kind: NodeKind,
  props: NodeProps,
  _r: RootContainer,
  h: Host,
  _o: OpaqueHandle
): TextFieldNodeSerialized {
  const id = h.nextId();
  return {
    id,
    kind: NodeKind.TextField,
    props: {
      ...props,
      children: undefined,
    },
    children: [],
  };
}

function createImageInstance(
  _kind: NodeKind,
  props: NodeProps,
  _r: RootContainer,
  h: Host,
  _o: OpaqueHandle
): ImageNodeSerialized {
  const id = h.nextId();
  const src = (props as ImageProps).src;
  return {
    id,
    kind: NodeKind.Image,
    props: {
      ...props,
      src,
      children: undefined,
    },
    children: [],
  };
}

function createButtonInstance(
  _kind: NodeKind,
  props: NodeProps,
  _r: RootContainer,
  h: Host,
  _o: OpaqueHandle
): ButtonNodeSerialized {
  const id = h.nextId();
  return {
    id,
    kind: NodeKind.Button,
    props: {
      ...props,
      children: undefined,
    },
    children: [],
  };
}

function createAudioInstance(
  _kind: NodeKind,
  props: NodeProps,
  _r: RootContainer,
  h: Host,
  _o: OpaqueHandle
): AudioNodeSerialized {
  const id = h.nextId();
  return {
    id,
    kind: NodeKind.Audio,
    props,
    children: [],
  };
}

function createVideoInstance(
  _kind: NodeKind,
  props: NodeProps,
  _r: RootContainer,
  h: Host,
  _o: OpaqueHandle
): VideoNodeSerialized {
  const id = h.nextId();
  return {
    id,
    kind: NodeKind.Video,
    props,
    children: [],
  };
}

function createLoadingInstance(
  _kind: NodeKind,
  props: NodeProps,
  _r: RootContainer,
  h: Host,
  _o: OpaqueHandle
): LoadingNodeSerialized {
  const id = h.nextId();
  return {
    id,
    kind: NodeKind.Loading,
    // @ts-ignore
    props,
    children: [],
  };
}

function createScrollBarInstance(
  _kind: NodeKind,
  props: NodeProps,
  _r: RootContainer,
  h: Host,
  _o: OpaqueHandle
): ScrollBarNodeSerialized {
  const id = h.nextId();
  return {
    id,
    kind: NodeKind.ScrollBar,
    props: {
      ...props,
      children: undefined,
    },
    children: [],
  };
}

function createSvgInstance(
  _kind: NodeKind,
  props: NodeProps,
  _r: RootContainer,
  h: Host,
  _o: OpaqueHandle
): SvgNodeSerialized {
  return {
    id: h.nextId(),
    kind: NodeKind.Svg,
    // @ts-ignore
    props: {
      ...props,
      children: undefined,
    },
    children: [],
  };
}

function createPathInstance(
  _kind: NodeKind,
  props: NodeProps,
  _r: RootContainer,
  h: Host,
  _o: OpaqueHandle
): PathNodeSerialized {
  return {
    id: h.nextId(),
    kind: NodeKind.Path,
    // @ts-ignore
    props: {
      ...props,
    },
    children: [],
  };
}

function createCircleInstance(
  _kind: NodeKind,
  props: NodeProps,
  _r: RootContainer,
  h: Host,
  _o: OpaqueHandle
): CircleNodeSerialized {
  return {
    id: h.nextId(),
    kind: NodeKind.Circle,
    // @ts-ignore
    props: {
      ...props,
    },
    children: [],
  };
}

function createIframeInstance(
  _kind: NodeKind,
  props: NodeProps,
  _r: RootContainer,
  h: Host,
  _o: OpaqueHandle
): IframeNodeSerialized {
  return {
    id: h.nextId(),
    kind: NodeKind.Iframe,
    // @ts-ignore
    props: {
      ...props,
    },
    children: [],
  };
}

function createCustomInstance(
  kind: string,
  props: NodeProps,
  _r: RootContainer,
  h: Host,
  _o: OpaqueHandle
): CustomNodeSerialized {
  return {
    id: h.nextId(),
    kind: NodeKind.Custom,
    // @ts-ignore
    props: {
      ...props,
      children: undefined,
    },
    children: [],
    component: kind,
  };
}

function createNavAnimationInstance(
  _kind: NodeKind,
  props: NodeProps,
  _r: RootContainer,
  h: Host,
  _o: OpaqueHandle
): NavAnimationNodeSerialized {
  return {
    id: h.nextId(),
    kind: NodeKind.NavAnimation,
    // @ts-ignore
    props: {
      ...props,
      children: undefined,
    },
    children: [],
  };
}

function createBalancesTableInstance(
  _kind: NodeKind,
  props: NodeProps,
  _r: RootContainer,
  h: Host,
  _o: OpaqueHandle
): BalancesTableNodeSerialized {
  return {
    id: h.nextId(),
    kind: NodeKind.BalancesTable,
    props: {
      ...props,
      children: undefined,
    },
    children: [],
  };
}

function createBalancesTableHeadInstance(
  _kind: NodeKind,
  props: NodeProps,
  _r: RootContainer,
  h: Host,
  _o: OpaqueHandle
): BalancesTableHeadNodeSerialized {
  return {
    id: h.nextId(),
    kind: NodeKind.BalancesTableHead,
    // @ts-ignore
    props: {
      ...props,
      children: undefined,
    },
    children: [],
  };
}

function createBalancesTableContentInstance(
  _kind: NodeKind,
  props: NodeProps,
  _r: RootContainer,
  h: Host,
  _o: OpaqueHandle
): BalancesTableContentNodeSerialized {
  return {
    id: h.nextId(),
    kind: NodeKind.BalancesTableContent,
    props: {
      ...props,
      children: undefined,
    },
    children: [],
  };
}

function createBalancesTableRowInstance(
  _kind: NodeKind,
  props: NodeProps,
  _r: RootContainer,
  h: Host,
  _o: OpaqueHandle
): BalancesTableRowNodeSerialized {
  const id = h.nextId();
  return {
    id,
    kind: NodeKind.BalancesTableRow,
    props: {
      ...props,
      children: undefined,
    },
    children: [],
  };
}

function createBalancesTableCellInstance(
  _kind: NodeKind,
  props: NodeProps,
  _r: RootContainer,
  h: Host,
  _o: OpaqueHandle
): BalancesTableCellNodeSerialized {
  return {
    id: h.nextId(),
    kind: NodeKind.BalancesTableCell,
    props: {
      ...props,
      children: undefined,
    },
    children: [],
  };
}

function createBalancesTableFooterInstance(
  _kind: NodeKind,
  props: NodeProps,
  _r: RootContainer,
  h: Host,
  _o: OpaqueHandle
): BalancesTableFooterNodeSerialized {
  return {
    id: h.nextId(),
    kind: NodeKind.BalancesTableFooter,
    props: {
      ...props,
      children: undefined,
    },
    children: [],
  };
}

export type RootContainer = {
  host: Host;
  children: Element[];
};

export type Host = {
  nextId: () => number;
};

export const HOST: Host = {
  nextId: (() => {
    let id = 0;
    return () => id++;
  })(),
};

type Style = React.CSSProperties;

//
// All node types.
//
export type NodeSerialized =
  | TableNodeSerialized
  | TableRowNodeSerialized
  | TextNodeSerialized
  | TextFieldNodeSerialized
  | ImageNodeSerialized
  | ViewNodeSerialized
  | ButtonNodeSerialized
  | LoadingNodeSerialized
  | ScrollBarNodeSerialized
  | SvgNodeSerialized
  | PathNodeSerialized
  | CircleNodeSerialized
  | IframeNodeSerialized
  | NavAnimationNodeSerialized
  | BalancesTableNodeSerialized
  | BalancesTableHeadNodeSerialized
  | BalancesTableContentNodeSerialized
  | BalancesTableRowNodeSerialized
  | BalancesTableCellNodeSerialized
  | BalancesTableFooterNodeSerialized
  | AudioNodeSerialized
  | VideoNodeSerialized
  | CustomNodeSerialized;

export type NodeProps =
  | TableProps
  | TableRowProps
  | TextProps
  | TextFieldProps
  | ImageProps
  | ViewProps
  | ButtonProps
  | LoadingProps
  | ScrollBarProps
  | IframeProps
  // TODO: add these and fix the types.
  //	| SvgProps
  //	| PathProps
  //	| CircleProps
  | NavAnimationProps
  | BalancesTableProps
  | BalancesTableHeadProps
  | BalancesTableContentProps
  | BalancesTableRowProps
  | BalancesTableCellProps
  | BalancesTableFooterProps
  | CustomProps;
export enum NodeKind {
  //
  // App.
  //
  Table = "Table",
  TableRow = "TableRow",
  Text = "Text",
  TextField = "TextField",
  Image = "Image",
  View = "View",
  Audio = "Audio",
  Video = "Video",
  Button = "Button",
  Loading = "Loading",
  ScrollBar = "ScrollBar",
  Svg = "Svg",
  Path = "Path",
  Circle = "Circle",
  Iframe = "Iframe",
  NavAnimation = "NavAnimation",

  //
  // Widget.
  //
  BalancesTable = "BalancesTable",
  BalancesTableHead = "BalancesTableHead",
  BalancesTableContent = "BalancesTableContent",
  BalancesTableRow = "BalancesTableRow",
  BalancesTableCell = "BalancesTableCell",
  BalancesTableFooter = "BalancesTableFooter",

  //
  // Custom
  //
  Custom = "Custom",
}

//
// Table.
//
type TableNodeSerialized = DefNodeSerialized<NodeKind.Table, TableProps>;
type TableProps = {
  style: Style;
  children: undefined;
};

//
// TableRow.
//
type TableRowNodeSerialized = DefNodeSerialized<
  NodeKind.TableRow,
  TableRowProps
>;
type TableRowProps = {
  style: Style;
  children: undefined;
};

//
// Text.
//
type TextNodeSerialized = DefNodeSerialized<NodeKind.Text, TextProps>;
type TextProps = {
  style: Style;
  children: undefined;
  tw: string;
};

//
// TextField.
//
type TextFieldNodeSerialized = DefNodeSerialized<
  NodeKind.TextField,
  TextFieldProps
>;
type TextFieldProps = {
  onChange?: (event: Event) => void;
  value?: any;
  multiline?: boolean;
  numberOfLines?: number;
  placeholder?: string;
  style: Style;
  children: undefined;
  tw: string;
};

//
// Image.
//
type ImageNodeSerialized = DefNodeSerialized<NodeKind.Image, ImageProps>;
type ImageProps = {
  style: Style;
  onClick?: (() => Promise<void>) | boolean;
  children: undefined;
  src: string;
  tw: string;
};

//
// View.
//
type ViewNodeSerialized = DefNodeSerialized<NodeKind.View, ViewProps>;
type ViewProps = {
  onClick?: () => Promise<void>;
  style: Style;
  children: undefined;
  tw: string;
};

//
// Button.
//
type ButtonNodeSerialized = DefNodeSerialized<NodeKind.Button, ButtonProps>;
type ButtonProps = {
  onClick?: (() => Promise<void>) | boolean;
  style: Style;
  children: undefined;
  tw: string;
};

//
// Loading.
//
type LoadingNodeSerialized = DefNodeSerialized<NodeKind.Loading, LoadingProps>;
type LoadingProps = {
  style: Style;
  children: undefined;
};

type AudioNodeSerialized = DefNodeSerialized<NodeKind.Audio, AudioProps>;
type AudioProps = {
  style: Style;
  children: undefined;
  volume: number;
  src: string;
  stream: MediaStream;
  muted: boolean;
  autoplay: boolean;
};

type VideoNodeSerialized = DefNodeSerialized<NodeKind.Video, VideoProps>;
type VideoProps = {
  style: Style;
  children: undefined;
  volume: number;
  src: string;
  stream: MediaStream;
  muted: boolean;
  autoplay: boolean;
  tw: string;
};

//
// ScrollBar.
//
type ScrollBarNodeSerialized = DefNodeSerialized<
  NodeKind.ScrollBar,
  ScrollBarProps
>;
type ScrollBarProps = {
  style: Style;
  children: undefined;
};

//
// Svg.
//
type SvgNodeSerialized = DefNodeSerialized<NodeKind.Svg, SvgProps>;
type SvgProps = {
  width: string;
  height: string;
  viewBox: string;
  fill: string;
  children: undefined;
  style: Style;
  tw: string;
};

//
// Path.
//
type PathNodeSerialized = DefNodeSerialized<NodeKind.Path, PathProps>;
type PathProps = {
  d: string;
  fill: string;
  style: Style;
  fillRule?: string;
  clipRule?: string;
  stroke?: string;
  tw: string;
};

type CircleNodeSerialized = DefNodeSerialized<NodeKind.Circle, CircleProps>;
type CircleProps = {
  cx: string;
  cy: string;
  r: string;
  fill: string;
  stroke: string;
  strokeWidth: string;
  pathLength: string;
  strokeDasharray: string;
  strokeDashoffset: string;
  tw: string;
};

//
// IFrame.
//
type IframeNodeSerialized = DefNodeSerialized<NodeKind.Iframe, IframeProps>;
type IframeProps = {
  style: Style;
  children: undefined;
  width: string;
  height: string;
  xnft: boolean;
  tw: string;
};

//
// Custom.
//
type CustomProps = any;

//
// NavAnimation.
//
type NavAnimationNodeSerialized = DefNodeSerialized<
  NodeKind.NavAnimation,
  NavAnimationProps
>;
type NavAnimationProps = {
  routeName: string;
  navAction: string;
  style: undefined;
  children: undefined;
};

//
// Raw Text.
//
export type TextSerialized = {
  id: number;
  kind: "raw";
  text: string | number;
  props: undefined;
  style: undefined;
};

//
// BalancesTable.
//
type BalancesTableNodeSerialized = DefNodeSerialized<
  NodeKind.BalancesTable,
  BalancesTableProps
>;
type BalancesTableProps = {
  style: Style;
  children: undefined;
};
type BalancesTableHeadNodeSerialized = DefNodeSerialized<
  NodeKind.BalancesTableHead,
  BalancesTableHeadProps
>;
type BalancesTableHeadProps = {
  style: Style;
  title: string;
  iconUrl: string;
  children: undefined;
};
type BalancesTableContentNodeSerialized = DefNodeSerialized<
  NodeKind.BalancesTableContent,
  BalancesTableContentProps
>;
type BalancesTableContentProps = {
  style: Style;
  children: undefined;
};
type BalancesTableRowNodeSerialized = DefNodeSerialized<
  NodeKind.BalancesTableRow,
  BalancesTableRowProps
>;
type BalancesTableRowProps = {
  onClick?: (() => Promise<void>) | boolean;
  style: Style;
  children: undefined;
};
type BalancesTableCellNodeSerialized = DefNodeSerialized<
  NodeKind.BalancesTableCell,
  BalancesTableCellProps
>;
type BalancesTableCellProps = {
  icon?: string;
  title?: string;
  subtitle?: string;
  usdValue?: number;
  percentChange?: number;
  style: Style;
  children: undefined;
};
type BalancesTableFooterNodeSerialized = DefNodeSerialized<
  NodeKind.BalancesTableFooter,
  BalancesTableFooterProps
>;
type BalancesTableFooterProps = {
  style: Style;
  children: undefined;
};

//
// Any element that can be placed in the Anchor App DOM.
//
export type Element = NodeSerialized | TextSerialized;

export type ElementPointer = {
  id: number;
  children?: Array<ElementPointer>;
};

type DefNodeSerialized<K, P> = {
  id: number;
  kind: K;
  props: P;
  children: Array<Element>;
};

type CustomNodeSerialized = {
  id: number;
  kind: NodeKind.Custom;
  props: CustomProps;
  children: Array<Element>;
  component: string;
};

export type UpdateDiff = any;

type HydratableInstance = never;
type ChildSet = never;
type TimeoutHandle = number;
const noTimeout = -1;
type NoTimeout = typeof noTimeout;
