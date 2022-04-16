import ReactReconciler, { HostConfig, OpaqueHandle } from "react-reconciler";

let ONCE = true;

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
    console.log("getRootHostContext");
    return root.host;
  },
  getChildHostContext: (
    parentHost: Host,
    kind: NodeKind,
    root: RootContainer
  ) => {
    console.log("getChildHostContext");
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
    console.log("createInstance", kind, props);
    switch (kind) {
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
      case NodeKind.Text:
        // TODO: props.
        return {
          id: h.nextId(),
          kind: NodeKind.Text,
          props: {
            ...props,
            children: undefined,
          },
          style: {},
          children: [],
        };
      case NodeKind.Image:
      case NodeKind.View:
      case NodeKind.TableRow:
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
    console.log("createTextInstance", text);
    return {
      id: h.nextId(),
      kind: "raw",
      text,
    };
  },

  //
  // Mutation.
  //
  appendChildToContainer: (
    c: RootContainer,
    child: NodeSerialized | TextSerialized
  ) => {
    console.log("appendChildToContainer", c, child);
    c.children.push(child);
  },
  appendInitialChild: (
    parent: NodeSerialized,
    child: NodeSerialized | TextSerialized
  ) => {
    console.log("appendInitialChild", parent, child);
    parent.children.push(child);
  },
  appendChild: (
    parent: NodeSerialized,
    child: NodeSerialized | TextSerialized
  ) => {
    console.log("appendChild", parent, child);
    parent.children.push(child);
  },
  insertInContainerBefore: (
    root: RootContainer,
    child: NodeSerialized | TextSerialized,
    before: NodeSerialized | TextSerialized
  ) => {
    console.log("insertInContainerBefore");
    const idx = root.children.indexOf(before);
    if (idx === -1) {
      throw new Error("child not found");
    }
    root.children = root.children
      .slice(0, idx)
      .concat([child])
      .concat(root.children.slice(idx));
  },
  insertBefore: (
    parent: NodeSerialized,
    child: NodeSerialized | TextSerialized,
    before: NodeSerialized | TextSerialized
  ) => {
    console.log("insertBefore");
    const idx = parent.children.indexOf(before);
    if (idx === -1) {
      throw new Error("child not found");
    }
    parent.children = parent.children
      .slice(0, idx)
      .concat([child])
      .concat(parent.children.slice(idx));
  },
  removeChild: (
    parent: NodeSerialized,
    child: NodeSerialized | TextSerialized
  ) => {
    console.log("removeChild");
    parent.children = parent.children.filter((c) => c !== child);
  },
  removeChildFromContainer: (
    root: RootContainer,
    child: NodeSerialized | TextSerialized
  ) => {
    console.log("removeChildFromContainer");
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
    console.log("prepareUpdate", instance, type, oldProps, newProps);
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
    console.log(
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
    console.log("prepareForCommit", _c);
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
    console.log(
      "commitUpdate",
      instance,
      type,
      updatePayload,
      oldProps,
      newProps
    );
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
    console.log("commitTextUpdate");
  },
  resetAfterCommit: (root: RootContainer) => {
    console.log("resetAfterCommit", root);
    if (ONCE) {
      ONCE = false;
      // @ts-ignore
      window.anchorUi.initRender(root.children);
    }
  },

  //
  // Misc.
  //
  getPublicInstance: (instance: NodeSerialized | TextSerialized) => {
    console.log("getPublicInstance");
    return instance;
  },
  shouldSetTextContent: () => {
    console.log("shouldSetTextContent");
    return false;
  },
  clearContainer: (root: RootContainer) => {
    console.log("clearContainer", root);
    root.children = [];
  },
  shouldDeleteUnhydratedTailInstances: () => {
    console.log("shouldDeleteUnhydratedTailInstances");
  },
  scheduleTimeout: (fn: () => void, delay: number) => {
    console.log("scheduleTimeout");
    return setTimeout(fn, delay);
  },
});

export type RootContainer = {
  host: Host;
  children: (NodeSerialized | TextSerialized)[];
};

export type Host = {
  commit: (instance: NodeSerialized | TextSerialized) => void;
  nextId: () => number;
};

export const HOST: Host = {
  commit: (instance: NodeSerialized | TextSerialized) => {},
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
  NodeSerialized | TextSerialized,
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
export type NodeSerialized = TableNodeSerialized | TextNodeSerialized;
type NodeProps = TableProps | TextProps;
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
type TableNodeSerialized = {
  id: number;
  kind: NodeKind.Table;
  props: TableProps;
  style: Style;
  children: Array<NodeSerialized | TextSerialized>;
};
type TableProps = {
  style: Style;
  children: undefined;
};

//
// Text.
//
type TextNodeSerialized = {
  id: number;
  kind: NodeKind.Text;
  props: TextProps;
  style: Style;
  children: Array<NodeSerialized | TextSerialized>;
};
type TextProps = {
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
