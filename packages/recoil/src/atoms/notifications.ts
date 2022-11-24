import { atom, atomFamily, selector, selectorFamily } from "recoil";
import {
  BACKEND_API_URL,
  fetchXnftsFromPubkey,
  EnrichedNotification,
  DbNotification,
} from "@coral-xyz/common";
import { anchorContext } from "./solana/wallet";
import { xnfts } from "./solana";
import getXnftProgramId from "@coral-xyz/xnft-explorer/src/App/_utils/getXnftProgramId";

export const recentNotifications = atomFamily<
  Array<EnrichedNotification>,
  {
    limit: number;
    offset: number;
  }
>({
  key: "recentNotifications",
  default: selectorFamily({
    key: "recentNotifications",
    get:
      ({ limit, offset }: { limit: number; offset: number }) =>
      async ({ get }: any) => {
        try {
          const provider = get(anchorContext).provider;
          const notificaitons =
            (await fetchNotifications("kira", offset, limit)) || [];
          const xnftIds = notificaitons.map((x) => x.xnftId);
          const uniqueXnftIds = xnftIds.filter(
            (x, index) => xnftIds.indexOf(x) === index
          );
          const xnftMetadata = await fetchXnftsFromPubkey(
            provider,
            uniqueXnftIds
          );
          return notificaitons.map((notificaiton) => {
            const metadata = xnftMetadata.find(
              (x) => x.xnftId === notificaiton.xnftId
            );
            return {
              ...notificaiton,
              xnftImage: metadata?.image || "",
              xnftTitle: metadata?.title || "",
              timestamp: new Date(notificaiton.timestamp).getTime(),
            };
          });
        } catch (e) {
          return [];
        }
      },
  }),
});

const fetchNotifications = (
  username: string,
  offset: number,
  limit: number
): Promise<DbNotification[]> => {
  return new Promise((resolve) => {
    fetch(
      `${BACKEND_API_URL}/notifications?username=${username}&limit=${limit}&offset=${offset}`,
      {
        method: "GET",
      }
    )
      .then(async (response) => {
        const json = await response.json();
        resolve(json.notifications || []);
      })
      .catch((e) => resolve([]));
  });
};
