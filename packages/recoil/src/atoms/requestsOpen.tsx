import { atom, selector } from "recoil";

export const requestsOpen = atom<boolean>({
  key: "requestsOpen",
  default: selector({
    key: "requestsOpenDefault",
    get: async () => {
      return false;
    },
  }),
});
