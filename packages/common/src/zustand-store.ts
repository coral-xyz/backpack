import { useStore as create } from "zustand";
import { createStore } from "zustand/vanilla";

// temporarily using a zustand store as it's a quick
// way to share a function (injectJavaScript) between
// the @coral-xyz/common and @coral-xyz/app packages
export const vanillaStore = createStore<{
  injectJavaScript?: (js: string) => void;
}>((set) => ({
  injectJavaScript: undefined,
  setInjectJavaScript: (injectJavaScript: any) =>
    set(() => ({ injectJavaScript })),
}));

export const useStore = create(vanillaStore);
