import { atom } from "recoil";

/**
 * A convenience atom for managing the visibility of
 * non-secure-ui bottom sheet modals
 */
export const modalVisible = atom<boolean>({
  key: "modalVisible",
  default: false,
});
