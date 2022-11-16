import { BN } from "@project-serum/anchor";
import { atom } from "recoil";
import getAllxNFTs from "../_utils/getAllXnfts";
import { XnftWithMetadata } from "../_types/XnftWithMetadata";
import solanaConnectionAtom from "./solanaConnectionAtom";

const xnftAtom = atom<XnftWithMetadata[]>({
  key: "xnftAtom",
  effects: [
    ({ setSelf, getPromise }) => {
      const fetchAllXnfts = async () => {
        const xnfts = await getAllxNFTs(
          window.xnft.solana.connection,
          window.xnft.solana.publicKey
        );
        window.xnft.setStorage("xnfts", JSON.stringify(xnfts));
        setSelf(xnfts);
      };

      window.xnft
        .getStorage("xnfts")
        .then((cache) => {
          if (cache) {
            const xnfts: XnftWithMetadata[] = JSON.parse(cache);
            setSelf(rehydrate(xnfts));
          }
        })
        .then(() => getPromise(solanaConnectionAtom))
        .then(async () => {
          await fetchAllXnfts();
        });
    },
  ],
});

function rehydrate(xnfts: XnftWithMetadata[]): XnftWithMetadata[] {
  xnfts.forEach((xnft) => {
    xnft.account.createdTs = new BN(xnft.account.createdTs, 16);
    xnft.account.updatedTs = new BN(xnft.account.updatedTs, 16);
    xnft.account.totalInstalls = new BN(xnft.account.totalInstalls, 16);
    xnft.account.installPrice = new BN(xnft.account.installPrice, 16);
    xnft.account.totalRating = new BN(xnft.account.totalRating, 16);
  });
  return xnfts;
}

export default xnftAtom;
