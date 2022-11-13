import { selector } from "recoil";
import { XnftWithMetadata } from "../_types/XnftWithMetadata";
import appFilterAtom from "./appFilterAtom";
import xnftsAtom from "./xnftsAtom";

const filteredXnftsAtom = selector<XnftWithMetadata[]>({
  key: "filteredXnftsAtom",
  get: ({ get }) => {
    const filter = get(appFilterAtom);
    let filteredList = get(xnftsAtom);

    console.log(filter);

    if (!filter.includeSuspended) {
      filteredList = filteredList.filter((app) => !app.account.suspended);
    }
    console.log(filteredList);
    switch (filter.sortBy) {
      case "installs": {
        filteredList.sort(
          (a, b) =>
            b.account.totalInstalls.toNumber() -
            a.account.totalInstalls.toNumber()
        );
      }
      case "ratings": {
        filteredList.sort(
          (a, b) =>
            b.account.totalRating.toNumber() - a.account.totalRating.toNumber()
        );
      }
      case "updated": {
        filteredList.sort(
          (a, b) =>
            b.account.updatedTs.toNumber() - a.account.updatedTs.toNumber()
        );
      }
      default: {
        filteredList.sort(
          (a, b) =>
            b.account.createdTs?.toNumber() - a.account.createdTs?.toNumber()
        );
      }
    }

    return filteredList;
  },
});

export default filteredXnftsAtom;
