import { atomFamily, selectorFamily } from "recoil";
import type { SplNftMetadataString, Nft } from "@coral-xyz/common";
import _ from "lodash";

type ContentMetadata = {
  name?: string;
  description?: string;
};

type ContentSymbol = {
  symbol?: string;
};

type ContentMetadataField = { $$schema: string } & (
  | ContentMetadata
  | ContentSymbol
);

// TODO(jon): Find a better shape for this
type MetaplexAsset = {
  // The mint
  id: string;
  mint: string;
  content: {
    metadata: ContentMetadataField[];
    links?: {
      external_url?: string;
    };
    files?: {
      uri: string;
    }[];
  };
  authorities: {
    address: string;
    scopes: "full"[];
  }[];
  royalty: {
    percent: number;
  };
  creators: {
    address: string;
    share: number;
    verified: boolean;
  }[];
};

const constructMetadataObj = (
  metadata: ContentMetadataField[]
): ContentMetadata & ContentSymbol => {
  const metadataObj: ContentMetadata & ContentSymbol = {};
  // TODO(jon): This needs to change when the API returns more metadata fields
  for (const field of metadata) {
    metadataObj[field.$$schema] = field[field.$$schema];
  }
  return metadataObj;
};

// This adapter is intended to map the Read API representation of both compressed and uncompressed NFTs
// into the NFT model that Backpack accepts.
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
    const metadata = constructMetadataObj(item.content.metadata);

    const updateAuthority =
      item.authorities.find((authority) => authority.scopes.includes("full"))
        ?.address ?? "";

    const image = Array.isArray(item.content.files)
      ? item.content.files[0]?.uri
      : "";
    const external_url = item.content.links?.external_url ?? "";

    let backpackNft: SplNftMetadataString & {
      external_url: string;
      image: string;
      metadata: Omit<
        SplNftMetadataString["metadata"],
        // This is currently being omitted because they're not displayed in a meaningful way
        "key" | "primarySaleHappened" | "isMutable" | "editionNonce"
      >;
    } = {
      publicKey: item.id,
      // TODO(jon): Add the metadata address
      metadataAddress: "",
      external_url,
      image,
      // @ts-ignore
      metadata: {
        mint: item.id,
        updateAuthority,
        data: {
          name: metadata.name ?? "",
          // We technically don't need `uri` because this information comes through the Read API
          uri: "",
          sellerFeeBasisPoints: item.royalty.percent * 100,
          creators: item.creators,
          symbol: metadata.symbol ?? "",
        },
      },
      tokenMetaUriData: {
        name: metadata.name,
        description: metadata.description,
        image,
        external_url,
        // TODO(jon): Surface these attributes after https://github.com/metaplex-foundation/digital-asset-rpc-infrastructure/issues/23
        attributes: [],
      },
    };

    backpackNftMap.set(backpackNft.publicKey, backpackNft);
  }
  return backpackNftMap;
};

export const solanaNftsFromApi = atomFamily({
  key: "solanaNfts",
  default: selectorFamily({
    key: "solanaNftsDefault",
    get:
      ({
        connectionUrl,
        publicKey,
      }: {
        connectionUrl: string;
        publicKey: string;
      }) =>
      async ({
        get,
      }): Promise<{
        splNftMetadata: Map<string, SplNftMetadataString>;
      }> => {
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
              // TODO(jon): This should uniquely identify this operation
              id: "rpd-op-123",
              // TODO(jon): Figure out if `created` is the best way to sort this.
              // TODO(jon): Need to properly handle pagination. Probably will just surface the whole list for now.
              params: [publicKey, "created", 2, 1, "", ""],
            }),
          };

          // The Metaplex Read API is surfaced on the same connection URL as the typical Solana RPC
          const json = await (await fetch(connectionUrl, options)).json();

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
