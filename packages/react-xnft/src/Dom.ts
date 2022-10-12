import {
  NodeKind,
  UpdateDiff,
  Element,
  TextSerialized,
  NodeSerialized,
} from "./index";

import { getLogger } from "@coral-xyz/common-public";
const logger = getLogger("react-xnft/reconciler");

//
// Note that we only handle methods in the "commit" phase of the react
// reconciler API.
//
export class Dom {
  private static instance: Dom;
  //
  // All Element objects in the dom. The _vdom elements and the _vdomRoot
  // elements are the same objects.
  //
  private _vdom: Map<number, Element>;
  private _vdomRoot: { children: Array<Element> };
  //
  // _renderFn maps node ID -> renderer function so that we only rerender
  // components that update.
  //
  private _renderFns: Map<number, (data: Element) => void>;
  //
  // Rerenders the root component.
  //
  private _renderRootFn?: (data: Array<Element>) => void;
  //
  // True when render root was called before setup was complete.
  //
  private _needsRenderRoot: boolean;

  private constructor() {
    this.clear();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new Dom();
    }
    return this.instance;
  }

  clear() {
    this._vdomRoot = { children: [] };
    this._vdom = new Map();
    this._renderFns = new Map();
  }

  onRender(viewId: number, fn: (data: Element) => void) {
    this._renderFns.set(viewId, fn);
  }

  onRenderRoot(fn: (data: Array<Element>) => void) {
    this._renderRootFn = fn;
    if (this._needsRenderRoot) {
      this._needsRenderRoot = false;
      this._renderRoot();
    }
  }

  commitUpdate(instanceId: number, updatePayload: UpdateDiff) {
    const instance = this._vdom.get(instanceId) as NodeSerialized;
    logger.debug("commitUpdate", instanceId, updatePayload, instance);

    if (!instance) {
      throw new Error("element not found");
    }

    switch (instance.kind) {
      case NodeKind.View:
        if (updatePayload.style) {
          instance.style = updatePayload.style;
        }
        break;
      case NodeKind.Text:
        if (updatePayload.style) {
          instance.style = updatePayload.style;
        }
        break;
      case NodeKind.TextField:
        if (updatePayload.value !== undefined && updatePayload.value !== null) {
          instance.props.value = updatePayload.value;
        }
        break;
      case NodeKind.NavAnimation:
        if (
          updatePayload.routeName !== undefined &&
          updatePayload.routeName !== null
        ) {
          instance.props.routeName = updatePayload.routeName;
        }
        break;
      case NodeKind.Path:
        if (updatePayload.fill !== undefined && updatePayload.fill !== null) {
          instance.props.fill = updatePayload.fill;
        }
        break;
      case NodeKind.Button:
        if (updatePayload.style !== undefined && updatePayload.style !== null) {
          instance.style = updatePayload.style;
        }
        break;
      case NodeKind.Image:
        if (updatePayload.style) {
          instance.style = updatePayload.style;
        }
        if (updatePayload.src) {
          instance.props.src = updatePayload.src;
        }
        break;
      default:
        throw new Error("invariant violation");
    }
    this._render(instanceId);
  }

  commitTextUpdate(textInstanceId: number, newText: string) {
    const textInstance = this._vdom.get(textInstanceId) as TextSerialized;
    textInstance.text = newText;
    this._render(textInstanceId);
  }

  appendChildToContainer(child: Element) {
    this._vdomRoot.children.push(child);

    this._saveToDom(child);
    this._renderRoot();
  }

  appendChild(parentId: number, child: Element) {
    const instance = this._vdom.get(parentId) as NodeSerialized;
    instance.children.push(child);

    this._saveToDom(child);
    this._render(parentId);
  }

  //
  // This method can be called for insertions as well as reordering, so we
  // remove the new child and do an insertion each time.
  //
  insertInContainerBefore(child: Element, beforeId: number) {
    const element = this._vdomRoot.children.find((e) => e.id === beforeId);
    if (!element) {
      throw new Error("element not found");
    }
    const newChildren = this._vdomRoot.children.filter(
      (c: Element) => c.id !== child.id
    );
    const idx = newChildren.indexOf(element);
    if (idx === -1) {
      throw new Error("child not found");
    }
    this._vdomRoot.children = newChildren
      .slice(0, idx)
      .concat([child])
      .concat(newChildren.slice(idx));

    this._saveToDom(child);
    this._renderRoot();
  }

  //
  // This method can be called for insertions as well as reordering, so we
  // remove the new child and do an insertion each time.
  //
  insertBefore(parentId: number, child: Element, beforeId: number) {
    //
    // Get the parent node.
    //
    const parent = this._vdom.get(parentId) as NodeSerialized;
    if (!parent) {
      throw new Error("parent not found");
    }

    //
    // Get the before node.
    //
    const beforeElement = parent.children.find(
      (e: Element) => e.id === beforeId
    ) as NodeSerialized;
    if (!beforeElement) {
      logger.error("before element not found", parent, child, beforeId);
      throw new Error("before element not found");
    }

    //
    // Remove the child from the parent to prepare for insertion.
    //
    const newChildren = parent.children.filter(
      (c: Element) => c.id !== child.id
    );

    //
    // Find the insertion point.
    //
    const beforeIdx = newChildren.indexOf(beforeElement);
    if (beforeIdx === -1) {
      throw new Error("child not found");
    }

    parent.children = newChildren
      .slice(0, beforeIdx)
      .concat([child])
      .concat(newChildren.slice(beforeIdx));

    this._saveToDom(child);
    this._render(parentId);
  }

  removeChild(parentId: number, childId: number) {
    const parent = this._vdom.get(parentId) as NodeSerialized;
    if (!parent) {
      throw new Error("parent not found");
    }
    parent.children = parent.children.filter((c: Element) => c.id !== childId);
    this._removeFromDom(this._vdom.get(childId)!);
    this._render(parentId);
  }

  removeChildFromContainer(childId: number) {
    this._vdomRoot.children = this._vdomRoot.children.filter(
      (c) => c.id !== childId
    );
    this._removeFromDom(this._vdom.get(childId)!);
    this._renderRoot();
  }

  _renderRoot() {
    if (!this._renderRootFn) {
      throw new Error("render root fn not found");
    }
    console.log("children are");
    console.log(this._vdomRoot.children);
    this._renderRootFn(this._vdomRoot.children);
  }

  private _render(instanceId: number) {
    const element = this._vdom.get(instanceId);
    if (!element) {
      throw new Error("element not found");
    }
    const renderFn = this._renderFns.get(instanceId);
    if (!renderFn) {
      throw new Error("render fn not found");
    }
    renderFn(element);
  }

  private _saveToDom(element: Element) {
    this._vdom.set(element.id, element);
    // @ts-ignore
    if (element.children) {
      // @ts-ignore
      element.children.forEach((e: Element) => {
        this._saveToDom(e);
      });
    }
  }

  private _removeFromDom(element: Element) {
    this._vdom.delete(element.id);
    // @ts-ignore
    if (element.children) {
      // @ts-ignore
      element.children.forEach((e: Element) => {
        this._removeFromDom(e);
      });
    }
  }
}

// Exposed in order to be accessable from Renderer.js
// @ts-ignore
if (!window.dom) {
  Object.defineProperties(window, { dom: { value: Dom.getInstance() } });
}
