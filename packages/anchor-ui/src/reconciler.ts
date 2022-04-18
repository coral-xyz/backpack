import ReactReconciler, { HostConfig, OpaqueHandle } from "react-reconciler";
import { debug } from "@200ms/common";

export const AnchorUi = {
  render(reactNode: any) {
    const cb = () => {};
    window.onload = () => {
      // @ts-ignore
      window.anchorUi.connect().then(() => {
        const root: RootContainer = {
          host: HOST,
          children: [],
        };
        const container = reconciler.createContainer(root, false, false);
        reconciler.updateContainer(reactNode, container, null, cb);
      });
    };
  },
};

const reconciler = ReactReconciler({
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
    debug("getRootHostContext");
    return root.host;
  },
  getChildHostContext: (
    parentHost: Host,
    kind: NodeKind,
    root: RootContainer
  ) => {
    debug("getChildHostContext");
    return parentHost;
  },

  //
  // Create serialized nodes.
  //
  createInstance: (
    kind: NodeKind,
    props: NodeProps,
    _r: RootContainer,
    h: Host,
    _o: OpaqueHandle
  ): NodeSerialized => {
    debug("createInstance", kind, props);
    switch (kind) {
      case NodeKind.View:
        // TODO: props.
        return {
          id: h.nextId(),
          kind: NodeKind.View,
          props: {
            ...props,
            children: undefined,
          },
          style: props.style || {},
          children: [],
        };
      case NodeKind.Table:
        // TODO: props.
        return {
          id: h.nextId(),
          kind: NodeKind.Table,
          props: {
            ...props,
            children: undefined,
          },
          style: props.style || {},
          children: [],
        };
      case NodeKind.TableRow:
        // TODO: props.
        return {
          id: h.nextId(),
          kind: NodeKind.TableRow,
          props: {
            ...props,
            children: undefined,
          },
          style: props.style || {},
          children: [],
        };
      case NodeKind.Text:
        // TODO: props.
        return {
          id: h.nextId(),
          kind: NodeKind.Text,
          props: {
            ...props,
            children: undefined,
          },
          style: props.style || {},
          children: [],
        };
      case NodeKind.Image:
        // TODO: props.
        return {
          id: h.nextId(),
          kind: NodeKind.Image,
          props: {
            ...props,
            children: undefined,
          },
          style: props.style || {},
          children: [],
        };
      default:
        throw new Error("unexpected node kind");
    }
  },
  createTextInstance: (
    text: string,
    _r: RootContainer,
    h: Host,
    _o: OpaqueHandle
  ): TextSerialized => {
    debug("createTextInstance", text);
    return {
      id: h.nextId(),
      kind: "raw",
      text,
      props: undefined,
      style: undefined,
    };
  },

  //
  // Mutation.
  //
  appendChildToContainer: (c: RootContainer, child: Element) => {
    debug("appendChildToContainer", c, child);
    c.children.push(child);
  },
  appendInitialChild: (parent: NodeSerialized, child: Element) => {
    debug("appendInitialChild", parent, child);
    parent.children.push(child);
  },
  appendChild: (parent: NodeSerialized, child: Element) => {
    debug("appendChild", parent, child);
    parent.children.push(child);
  },
  insertInContainerBefore: (
    root: RootContainer,
    child: Element,
    before: Element
  ) => {
    debug("insertInContainerBefore");
    const idx = root.children.indexOf(before);
    if (idx === -1) {
      throw new Error("child not found");
    }
    root.children = root.children
      .slice(0, idx)
      .concat([child])
      .concat(root.children.slice(idx));
  },
  insertBefore: (parent: NodeSerialized, child: Element, before: Element) => {
    debug("insertBefore");
    const idx = parent.children.indexOf(before);
    if (idx === -1) {
      throw new Error("child not found");
    }
    parent.children = parent.children
      .slice(0, idx)
      .concat([child])
      .concat(parent.children.slice(idx));
  },
  removeChild: (parent: NodeSerialized, child: Element) => {
    debug("removeChild");
    parent.children = parent.children.filter((c) => c !== child);
  },
  removeChildFromContainer: (root: RootContainer, child: Element) => {
    debug("removeChildFromContainer");
    root.children = root.children.filter((c) => c !== child);
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
    debug("prepareUpdate", instance, type, oldProps, newProps);
    // TODO.
    return {
      old: oldProps,
      new: newProps,
    };
  },
  finalizeInitialChildren: (
    _parent: NodeSerialized,
    _kind: NodeKind,
    _props: NodeProps,
    _root: RootContainer,
    _host: Host
  ): boolean => {
    debug("finalizeInitialChildren", _parent, _kind, _props, _root, _host);
    return false;
  },

  //
  // Commit phase.
  //
  prepareForCommit: (_c: RootContainer) => {
    debug("prepareForCommit", _c);
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
    debug("commitUpdate", instance, type, updatePayload, oldProps, newProps);
    // TODO.
    //
    // - give a unique id to the update diff
    // - assert ordering on the receiving end
    // - if the order is not correct, store away the request and
    //   batch process once the next seqno is received
  },
  commitTextUpdate: (
    textInstance: TextSerialized,
    oldText: string,
    nextText: string
  ) => {
    debug("commitTextUpdate");
  },
  resetAfterCommit: (root: RootContainer) => {
    debug("resetAfterCommit", root);

    //
    // Perform the initial render exactly once.
    //
    if (!root.host.didRenderInit) {
      console.log("INIT RENDER HERE!!!!!!!!!");
      root.host.didRenderInit = true;
      // @ts-ignore
      window.anchorUi.initRender(root.children);
    }
  },

  //
  // Misc.
  //
  getPublicInstance: (instance: Element) => {
    debug("getPublicInstance");
    return instance;
  },
  shouldSetTextContent: () => {
    debug("shouldSetTextContent");
    return false;
  },
  clearContainer: (root: RootContainer) => {
    debug("clearContainer", root);
    root.children = [];
  },
  shouldDeleteUnhydratedTailInstances: () => {
    debug("shouldDeleteUnhydratedTailInstances");
  },
  scheduleTimeout: (fn: () => void, delay: number) => {
    debug("scheduleTimeout");
    return setTimeout(fn, delay);
  },
});

export type RootContainer = {
  host: Host;
  children: Element[];
};

export type Host = {
  didRenderInit: boolean;
  nextId: () => number;
};

export const HOST: Host = {
  didRenderInit: false,
  nextId: (() => {
    let id = 0;
    return () => id++;
  })(),
};

type _HostConfig = HostConfig<
  NodeKind,
  NodeProps,
  RootContainer,
  NodeSerialized,
  TextSerialized,
  HydratableInstance,
  Element,
  Host,
  UpdateDiff,
  ChildSet,
  TimeoutHandle,
  NoTimeout
>;

type Style = any;

//
// All node types.
//
export type NodeSerialized =
  | TableNodeSerialized
  | TableRowNodeSerialized
  | TextNodeSerialized
  | ImageNodeSerialized
  | ViewNodeSerialized;
type NodeProps =
  | TableProps
  | TableRowProps
  | TextProps
  | ImageProps
  | ViewProps;
enum NodeKind {
  Table = "Table",
  TableRow = "TableRow",
  Text = "Text",
  Image = "Image",
  View = "View",
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
};

//
// Image.
//
type ImageNodeSerialized = DefNodeSerialized<NodeKind.Image, ImageProps>;
type ImageProps = {
  style: Style;
  children: undefined;
};

//
// View.
//
type ViewNodeSerialized = DefNodeSerialized<NodeKind.View, ViewProps>;
type ViewProps = {
  style: Style;
  children: undefined;
};

//
// Text.
//
export type TextSerialized = {
  id: number;
  kind: "raw";
  text: string | number;
  props: undefined;
  style: undefined;
};

//
// Any element that can be placed in the Anchor App DOM.
//
export type Element = NodeSerialized | TextSerialized;

type DefNodeSerialized<K, P> = {
  id: number;
  kind: K;
  props: P;
  style: Style;
  children: Array<Element>;
};

type UpdateDiff = {
  old: NodeProps;
  new: NodeProps;
};

type HydratableInstance = never;
type ChildSet = never;
type TimeoutHandle = number;
const noTimeout = -1;
type NoTimeout = typeof noTimeout;
