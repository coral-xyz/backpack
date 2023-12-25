import { useStore as useZustandStore } from "zustand";
import { createStore } from "zustand/vanilla";

type jsFn = (code: string) => void;
export interface State {
  injectJavaScriptIntoHiddenWebView?: jsFn;
  setInjectJavaScriptIntoHiddenWebView: (
    injectJavaScriptIntoHiddenWebView: jsFn
  ) => void;
  injectJavaScriptIntoBrowserWebView?: jsFn;
  setInjectJavaScriptIntoBrowserWebView: (
    injectJavaScriptIntoBrowserWebView: jsFn
  ) => void;

  /**
   * A function that closes the secure UI bottom-sheet/modal
   */
  closeSecureUI?: () => void;
  setCloseSecureUI: (closeSecureUI: () => void) => void;
}

export const vanillaStore = createStore<State>((set) => ({
  injectJavaScriptIntoHiddenWebView: undefined,
  setInjectJavaScriptIntoHiddenWebView: (
    injectJavaScriptIntoHiddenWebView: jsFn
  ) => set(() => ({ injectJavaScriptIntoHiddenWebView })),
  injectJavaScriptIntoBrowserWebView: undefined,
  setInjectJavaScriptIntoBrowserWebView: (
    injectJavaScriptIntoBrowserWebView: jsFn
  ) => set(() => ({ injectJavaScriptIntoBrowserWebView })),

  closeSecureUI: undefined,
  setCloseSecureUI: (closeSecureUI: () => void) =>
    set(() => ({ closeSecureUI })),
}));

export function useStore(): State;
export function useStore<T>(
  selector: (state: State) => T,
  equals?: (a: T, b: T) => boolean
): T;
export function useStore<T>(
  selector?: (state: State) => T,
  equals?: (a: T, b: T) => boolean
) {
  return useZustandStore(vanillaStore, selector!, equals);
}
