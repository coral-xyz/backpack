import { atom, selector } from "recoil";

type AppFilterAtom = {
  search: string;
  sortBy: "updated" | "ratings" | "installs";
  includeSuspended: boolean;
};

const appFilterStoreageAtom = atom<Partial<AppFilterAtom>>({
  key: "appFilterStoreageAtom",
  default: {},
});

const appFilterAtom = selector<Partial<AppFilterAtom>>({
  key: "appFilterAtom",
  get: ({ get }) => get(appFilterStoreageAtom),
  set: ({ set }, newValue) =>
    set(appFilterStoreageAtom, (oldValue) => ({ ...oldValue, ...newValue })),
});

export default appFilterAtom;
