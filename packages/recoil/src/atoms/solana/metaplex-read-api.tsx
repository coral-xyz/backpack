import { atomFamily, selector, selectorFamily } from "recoil";
import { BACKPACK_FEATURE_READ_API, Blockchain } from "@coral-xyz/common";
import type { SplNftMetadataString, Nft } from "@coral-xyz/common";
import _ from "lodash";

// TODO(jon): Find a better shape for this
type MetaplexAsset = {
  // The mint
  id: string;
  mint: string;
  content: {
    metadata: ({ name?: string; description?: string } | { symbol?: string })[];
    links?: {
      external_url?: string;
    };
    files?: {
      uri: string;
    }[];
  };
};

const readApiAdapter = async (json: {
  result: { items: MetaplexAsset[] };
}): Promise<
  Map<
    string,
    SplNftMetadataString & {
      tokenMetaUriData: { external_url: string; image: string };
    }
  >
> => {
  const backpackNftMap = new Map<string, SplNftMetadataString>();
  for await (const item of json.result.items) {
    // This sucks
    const metadata = item.content.metadata.find((_m) => "name" in _m)!;
    const data = item.content.metadata.find((_m) => "symbol" in _m)!;

    let backpackModel: SplNftMetadataString & {
      external_url: string;
      image: string;
    } = {
      publicKey: item.id,
      metadata: {
        mint: item.id,
        // @ts-ignore
        data: {
          // @ts-ignore
          symbol: data.symbol,
        },
      },
      tokenMetaUriData: {
        // @ts-ignore
        name: metadata.name ?? "",
        // @ts-ignore
        description: metadata.description ?? "",
        image:
          // @ts-ignore
          item.content.files?.length > 0 ? item.content.files[0].uri : "",
        external_url: item.content.links?.external_url ?? "",
        attributes: [],
      },
    };

    backpackNftMap.set(backpackModel.publicKey, backpackModel);
  }
  return backpackNftMap;
};

export const solanaNftsFromApi = atomFamily({
  key: "solanaNfts",
  default: selectorFamily({
    key: "solanaNftsDefault",
    get:
      ({ publicKey }: { publicKey: string }) =>
      async ({
        get,
      }): Promise<{
        splNftMetadata: Map<string, SplNftMetadataString>;
      }> => {
        // Will need to switch between URLs soon
        // const { connection } = get(anchorContext);

        //
        // Fetch token data.
        //
        try {
          const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              method: "get_assets_by_owner",
              id: "rpd-op-123",
              // TODO(jon): Figure out if `created` is the best way to sort this.
              // TODO(jon): Need to properly handle pagination. Probably will just surface the whole list for now.
              params: [publicKey, "created", 2, 1, "", ""],
            }),
          };

          const json = await (
            await fetch(BACKPACK_FEATURE_READ_API, options)
          ).json();

          const nftsMap = await readApiAdapter(json);

          return {
            splNftMetadata: nftsMap,
          };
        } catch (error) {
          console.error("could not fetch solana token data", error);
          return {
            splNftMetadata: new Map(),
          };
        }
      },
  }),
});
