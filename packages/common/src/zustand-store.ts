import create from "zustand";
import vanilla from "zustand/vanilla";

// temporarily using a zustand store as it's a quick
// way to share a function (injectJavaScript) between
// @coral-xyz/common and @coral-xyz/app-mobile
export const vanillaStore = vanilla<{
  injectJavaScript?: (js: string) => void;
}>((set) => ({
  injectJavaScript: undefined,
  setInjectJavaScript: (injectJavaScript: any) =>
    set(() => ({ injectJavaScript })),
}));

export const useStore = create(vanillaStore);
