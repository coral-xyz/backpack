import ReactReconciler, { HostConfig, OpaqueHandle } from "react-reconciler";
import {
  getLogger,
  RECONCILER_BRIDGE_METHOD_MOUNT,
  RECONCILER_BRIDGE_METHOD_CREATE_INSTANCE,
  RECONCILER_BRIDGE_METHOD_COMMIT_UPDATE,
  RECONCILER_BRIDGE_METHOD_COMMIT_TEXT_UPDATE,
  RECONCILER_BRIDGE_METHOD_APPEND_CHILD_TO_CONTAINER,
  RECONCILER_BRIDGE_METHOD_APPEND_INITIAL_CHILD,
  RECONCILER_BRIDGE_METHOD_APPEND_CHILD,
  RECONCILER_BRIDGE_METHOD_INSERT_IN_CONTAINER_BEFORE,
  RECONCILER_BRIDGE_METHOD_INSERT_BEFORE,
  RECONCILER_BRIDGE_METHOD_REMOVE_CHILD,
  RECONCILER_BRIDGE_METHOD_REMOVE_CHILD_FROM_CONTAINER,
} from "@200ms/common";

const logger = getLogger("anchor-ui-reconciler");

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
    logger.debug("getRootHostContext");
    return root.host;
  },
  getChildHostContext: (
    parentHost: Host,
    kind: NodeKind,
    root: RootContainer
  ) => {
    logger.debug("getChildHostContext");
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
    logger.debug("createInstance", kind, props);
    switch (kind) {
      case NodeKind.View:
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
    logger.debug("createTextInstance", text);
    const instance = {
      id: h.nextId(),
      kind: "raw" as "raw", // ts wtf?
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
    switch (type) {
      case NodeKind.View:
        return null;
      case NodeKind.Table:
        return null;
      case NodeKind.TableRow:
        return null;
      case NodeKind.Text:
        return null;
      case NodeKind.Image:
        return null;
      default:
        throw new Error("unexpected node kind");
    }
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
    if (updatePayload === null) {
      return;
    }

    switch (type) {
      case NodeKind.View:
        break;
      case NodeKind.Table:
        break;
      case NodeKind.TableRow:
        break;
      case NodeKind.Text:
        break;
      case NodeKind.Image:
        break;
      default:
        throw new Error("unexpected node kind");
    }

    // @ts-ignore
    window.anchorUi.request({
      method: RECONCILER_BRIDGE_METHOD_COMMIT_UPDATE,
      params: [instance.id, updatePayload],
    });
  },
  commitTextUpdate: (
    textInstance: TextSerialized,
    oldText: string,
    nextText: string
  ) => {
    logger.debug("commitTextUpdate");
    textInstance.text = nextText;

    // @ts-ignore
    window.anchorUi.request({
      method: RECONCILER_BRIDGE_METHOD_COMMIT_TEXT_UPDATE,
      params: [textInstance.id, nextText],
    });
  },
  appendChildToContainer: (c: RootContainer, child: Element) => {
    logger.debug("appendChildToContainer", c, child);
    c.children.push(child);

    // @ts-ignore
    window.anchorUi.request({
      method: RECONCILER_BRIDGE_METHOD_APPEND_CHILD_TO_CONTAINER,
      params: [child],
    });
  },
  appendChild: (parent: NodeSerialized, child: Element) => {
    logger.debug("appendChild", parent, child);
    parent.children.push(child);

    // @ts-ignore
    window.anchorUi.request({
      method: RECONCILER_BRIDGE_METHOD_APPEND_CHILD,
      params: [parent.id, child],
    });
  },
  insertInContainerBefore: (
    root: RootContainer,
    child: Element,
    before: Element
  ) => {
    logger.debug("insertInContainerBefore");

    const newChildren = root.children.filter((c: Element) => c.id !== child.id);

    const idx = root.children.indexOf(before);
    if (idx === -1) {
      throw new Error("child not found");
    }

    root.children = newChildren
      .slice(0, idx)
      .concat([child])
      .concat(root.children.slice(idx));

    // @ts-ignore
    window.anchorUi.request({
      method: RECONCILER_BRIDGE_METHOD_INSERT_IN_CONTAINER_BEFORE,
      params: [child, before.id],
    });
  },
  insertBefore: (parent: NodeSerialized, child: Element, before: Element) => {
    logger.debug("insertBefore");
    const newChildren = parent.children.filter(
      (c: Element) => c.id !== child.id
    );

    const idx = parent.children.indexOf(before);
    if (idx === -1) {
      throw new Error("child not found");
    }

    parent.children = newChildren
      .slice(0, idx)
      .concat([child])
      .concat(parent.children.slice(idx));

    // @ts-ignore
    window.anchorUi.request({
      method: RECONCILER_BRIDGE_METHOD_INSERT_BEFORE,
      params: [parent.id, child, before.id],
    });
  },
  removeChild: (parent: NodeSerialized, child: Element) => {
    logger.debug("removeChild", parent, child);

    parent.children = parent.children.filter((c) => c !== child);

    // @ts-ignore
    window.anchorUi.request({
      method: RECONCILER_BRIDGE_METHOD_REMOVE_CHILD,
      params: [parent.id, child.id],
    });
  },
  removeChildFromContainer: (root: RootContainer, child: Element) => {
    logger.debug("removeChildFromContainer", root, child);

    root.children = root.children.filter((c) => c !== child);

    // @ts-ignore
    window.anchorUi.request({
      method: RECONCILER_BRIDGE_METHOD_REMOVE_CHILD_FROM_CONTAINER,
      params: [child.id],
    });
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

export type ElementPointer = {
  id: number;
  children?: Array<ElementPointer>;
};

type DefNodeSerialized<K, P> = {
  id: number;
  kind: K;
  props: P;
  style: Style;
  children: Array<Element>;
};

export type UpdateDiff = any;

type HydratableInstance = never;
type ChildSet = never;
type TimeoutHandle = number;
const noTimeout = -1;
type NoTimeout = typeof noTimeout;
