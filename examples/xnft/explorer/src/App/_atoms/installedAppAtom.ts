import { atom } from "recoil";
import xnftAtom from "./xnftsAtom";

const installedAppAtom = atom<string[]>({
  key: "installedAppAtom",
  effects: [
    ({ setSelf, getPromise }) => {
      setSelf(
        getPromise(xnftAtom).then((xnfts) =>
          xnfts
            .filter((xnft) => xnft.installed)
            .map((xnft) => xnft.publicKey.toString())
        )
      );
    },
  ],
});

export default installedAppAtom;
