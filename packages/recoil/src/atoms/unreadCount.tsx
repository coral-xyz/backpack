import { atom, selector } from "recoil";

export const unreadCount = atom<number>({
  key: "unreadCount",
  default: selector({
    key: "unreadCountDefaults",
    get: async ({ get }) => {
      return 0;
    },
  }),
});
