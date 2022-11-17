import { BN } from "@project-serum/anchor";
import { atom, atomFamily } from "recoil";
import getAllxNFTs from "../_utils/getAllXnfts";
import { XnftWithMetadata } from "../_types/XnftWithMetadata";
import solanaConnectionAtom from "./solanaConnectionAtom";
import { Review } from "../_types/XnftReview";
import getXnftReviews from "../_utils/getXnftReviews";
import { PublicKey } from "@metaplex-foundation/js";

const reviewsAtom = atomFamily<Review[], string>({
  key: "reviewsAtom",
  effects: (pubKey) => [
    ({ setSelf, getPromise }) => {
      window.xnft
        .getStorage(pubKey + "xnftsReview")
        .then((cache) => {
          if (cache) {
            const reviews: Review[] = JSON.parse(cache);
            setSelf(reviews);
          }
        })
        .then(() => getPromise(solanaConnectionAtom))
        .then(async () => {
          const xnfts = await getXnftReviews(
            window.xnft.solana.connection,
            new PublicKey(pubKey)
          );
          window.xnft.setStorage(pubKey + "xnftsReview", JSON.stringify(xnfts));
          setSelf(xnfts);
        });
    },
  ],
});

export default reviewsAtom;
