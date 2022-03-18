import { atom } from "recoil";

/**
 * Toggle for darkmode.
 */
export const isDarkMode = atom<boolean>({
  key: "isDarkMode",
  default: true,
});
