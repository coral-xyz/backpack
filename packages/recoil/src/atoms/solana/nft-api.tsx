import { atomFamily, selector, selectorFamily } from "recoil";
import { anchorContext } from "./wallet";
import { PublicKey } from "@solana/web3.js";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { BACKPACK_FEATURE_READ_API } from "@coral-xyz/common";
import type { SplNftMetadataString } from "@coral-xyz/common";

const readApiAdapter = async (
  connection,
  json
): Promise<Map<string, SplNftMetadataString>> => {
  const backpackNftMap = new Map<string, any>();
  for await (const item of json.result.items) {
    // @ts-ignore
    let backpackModel: BackpackNftModel = {
      metadataAddress: item.id,
    };
    // This is only needed until Read API surfaces this info natively.
    const metadata = await Metadata.fromAccountAddress(
      connection,
      new PublicKey(item.id)
    );
    backpackModel.metadata = {
      ...metadata,
      mint: metadata.mint.toBase58(),
      updateAuthority: metadata.mint.toBase58(),
    };
    backpackModel.publicKey = metadata.mint.toBase58();

    // This is only needed until Read API surfaces this info natively.
    const metadataJsonManifest = await (await fetch(metadata.data.uri)).json();
    backpackModel.tokenMetaUriData = metadataJsonManifest;

    backpackNftMap.set(backpackModel.publicKey, backpackModel);
  }
  console.info(backpackNftMap);
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
        const { connection } = get(anchorContext);

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
              // TODO(jon): Re-enable this when the Read API works
              // params: [publicKey, "created", 10, 1, "", ""],
              params: [
                "CMvMqPNKHikuGi7mrngvQzFeQ4rndDnopx3kc9drne8M",
                // TODO(jon): Figure out if `created` is the best way to sort this.
                "created",
                // TODO(jon): Need to properly handle pagination. Probably will just surface the whole list for now.
                2,
                1,
                "",
                "",
              ],
            }),
          };

          const json = await (
            await fetch(BACKPACK_FEATURE_READ_API, options)
          ).json();

          const nftsMap = await readApiAdapter(connection, json);

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
