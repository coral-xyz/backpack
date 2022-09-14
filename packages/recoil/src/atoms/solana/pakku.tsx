import { selector } from "recoil";
import { bootstrap } from "../bootstrap";

export const pakkus = selector<Array<any>>({
  key: "pakkusDefault",
  get: async ({ get }) => {
    const b = get(bootstrap);
    return await b.pakkus;
  },
});
