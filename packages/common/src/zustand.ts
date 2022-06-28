import vanilla from "zustand/vanilla";
import create from "zustand";

export const vanillaStore = vanilla((set) => ({
  backgroundWrapper: undefined,
  setBackgroundWrapper: (backgroundWrapper) =>
    set(() => ({ backgroundWrapper })),
}));

export const useStore = create(vanillaStore);
