import { create } from "zustand";

type jsFn = (code: string) => void;

interface State {
  injectJavaScript: jsFn | undefined;
  setInjectJavaScript: (injectJavaScript: jsFn) => void;
}

export const useStore = create<State>((set) => ({
  injectJavaScript: undefined,
  setInjectJavaScript: (injectJavaScript: jsFn) =>
    set(() => ({ injectJavaScript })),
}));
