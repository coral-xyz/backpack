import { atom, selector } from "recoil";

type AppFilterAtom = {
  sortBy: "updated" | "ratings" | "installs" | "created";
  includePrice: "all" | "paidOnly" | "freeOnly";
  sortDesc: boolean;
  includeSuspended: boolean;
  includeInstalled: boolean;
};

const appFilterStoreageAtom = atom<Partial<AppFilterAtom>>({
  key: "appFilterStoreageAtom",
  default: {
    sortBy: "ratings",
    sortDesc: true,
    includeSuspended: false,
    includePrice: "all",
    includeInstalled: true,
  },
});

const appFilterAtom = selector<Partial<AppFilterAtom>>({
  key: "appFilterAtom",
  get: ({ get }) => get(appFilterStoreageAtom),
  set: ({ set }, newValue) =>
    set(appFilterStoreageAtom, (oldValue) => ({ ...oldValue, ...newValue })),
});

export default appFilterAtom;
