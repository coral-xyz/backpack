// import create from "zustand";
import create from "zustand";
import vanilla from "zustand/vanilla";

// temporarily using a zustand store as it's a quick
// way to share a function (injectJavaScript) between
// the @coral-xyz/common and @coral-xyz/app packages
export const vanillaStore = vanilla<{
  injectJavaScript?: (js: string) => void;
}>((set) => ({
  injectJavaScript: undefined,
  setInjectJavaScript: (injectJavaScript) => set(() => ({ injectJavaScript })),
}));

export const useStore = create(vanillaStore);
