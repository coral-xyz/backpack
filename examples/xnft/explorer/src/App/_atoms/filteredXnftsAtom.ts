import { selector } from "recoil";
import { XnftWithMetadata } from "../_types/XnftWithMetadata";
import appFilterAtom from "./appFilterAtom";
import xnftsAtom from "./xnftsAtom";
import memoize from "nano-memoize";

const filterList = memoize(
  (list, includeSuspended, includePrice, includeInstalled) =>
    list.filter((app) => {
      if (
        (!includeSuspended && app?.account?.suspended) ||
        (includePrice === "freeOnly" &&
          app.account?.installPrice?.toNumber() > 0) ||
        (includePrice === "paidOnly" &&
          app.account?.installPrice?.toNumber() <= 0) ||
        (!includeInstalled && app.installed)
      ) {
        return false;
      }
      return true;
    })
);

const filteredXnftsAtom = selector<XnftWithMetadata[]>({
  key: "filteredXnftsAtom",
  get: ({ get }) => {
    const filter = get(appFilterAtom);
    const xnfts = get(xnftsAtom);
    let filteredList = [
      ...filterList(
        xnfts,
        filter.includeSuspended,
        filter.includePrice,
        filter.includeInstalled
      ),
    ];

    if (!filter.sortDesc) {
      switch (filter.sortBy) {
        case "installs": {
          filteredList.sort(
            (a, b) =>
              a.account.totalInstalls.toNumber() -
              b.account.totalInstalls.toNumber()
          );
          break;
        }
        case "ratings": {
          filteredList.sort(
            (a, b) =>
              a.account.totalRating.toNumber() -
              b.account.totalRating.toNumber()
          );
          break;
        }
        case "updated": {
          filteredList.sort(
            (a, b) =>
              a.account.updatedTs.toNumber() - b.account.updatedTs.toNumber()
          );
          break;
        }
        default: {
          filteredList.sort(
            (a, b) =>
              a.account.createdTs.toNumber() - b.account.createdTs.toNumber()
          );
          break;
        }
      }
    } else {
      switch (filter.sortBy) {
        case "installs": {
          filteredList.sort(
            (a, b) =>
              b.account.totalInstalls.toNumber() -
              a.account.totalInstalls.toNumber()
          );
          break;
        }
        case "ratings": {
          filteredList.sort(
            (a, b) =>
              b.account.totalRating.toNumber() -
              a.account.totalRating.toNumber()
          );
          break;
        }
        case "updated": {
          filteredList.sort(
            (a, b) =>
              b.account.updatedTs.toNumber() - a.account.updatedTs.toNumber()
          );
          break;
        }
        default: {
          filteredList.sort(
            (a, b) =>
              b.account.createdTs.toNumber() - a.account.createdTs.toNumber()
          );
        }
      }
    }
    return filteredList;
  },
});

export default filteredXnftsAtom;
