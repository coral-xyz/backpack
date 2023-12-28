import { atom } from "recoil";

export const showSpotlight = atom<boolean>({
  key: "showSpotlight",
  default: false,
});
