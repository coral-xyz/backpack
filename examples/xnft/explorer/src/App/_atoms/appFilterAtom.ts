import { atom, selector } from "recoil";

type AppFilterAtom = {
  sortBy: "updated" | "ratings" | "installs" | "created";
  sortDesc: boolean;
  includeSuspended: boolean;
};

const appFilterStoreageAtom = atom<Partial<AppFilterAtom>>({
  key: "appFilterStoreageAtom",
  default: {
    sortBy: "ratings",
    sortDesc: true,
    includeSuspended: false,
  },
});

const appFilterAtom = selector<Partial<AppFilterAtom>>({
  key: "appFilterAtom",
  get: ({ get }) => get(appFilterStoreageAtom),
  set: ({ set }, newValue) =>
    set(appFilterStoreageAtom, (oldValue) => ({ ...oldValue, ...newValue })),
});

export default appFilterAtom;
