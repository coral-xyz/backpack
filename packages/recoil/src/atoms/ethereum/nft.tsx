import { selector } from "recoil";
import {
  externalResourceUri,
  Blockchain,
  NftCollection,
  EthereumNft,
  ALCHEMY_ETHEREUM_MAINNET_API_KEY,
} from "@coral-xyz/common";
import { activeEthereumWallet } from "../wallet";

export const ethereumNftCollections = selector<NftCollection[]>({
  key: "ethereumNftCollections",
  get: async ({ get }) => {
    const wallet = get(activeEthereumWallet);
    if (!wallet) return [];

    const url = `https://eth-mainnet.g.alchemy.com/nft/v2/${ALCHEMY_ETHEREUM_MAINNET_API_KEY}/getNFTs?owner=${wallet.publicKey}`;
    const response = await fetch(url);
    const data = await response.json();

    const collections: Map<string, any> = new Map();
    for (const nft of data.ownedNfts) {
      if (!nft.contractMetadata) continue;
      const collectionId = nft.contract.address;
      const collection = collections.get(collectionId);
      if (!collection) {
        collections.set(collectionId, {
          id: collectionId,
          name: nft.contractMetadata.name,
          symbol: nft.contractMetadata.symbol,
          tokenType: nft.contractMetadata.tokenType,
          totalSupply: nft.contractMetadata.totalSupply,
          items: [],
        });
      }
      collections.get(collectionId).items.push({
        // Token ID is not unique so prepend with contract address
        id: `${nft.contract.address}/${nft.id.tokenId}`,
        blockchain: Blockchain.ETHEREUM,
        tokenId: nft.id.tokenId,
        contractAddress: nft.contract.address,
        name: nft.metadata.name || nft.contractMetadata.name,
        description: nft.metadata.description,
        externalUrl: externalResourceUri(nft.metadata.external_url),
        imageUrl:
          externalResourceUri(nft.metadata.image) ||
          externalResourceUri(nft.metadata.image_url),
        attributes:
          nft.metadata.attributes &&
          nft.metadata.attributes.map(
            (a: { trait_type: string; value: string }) => ({
              traitType: a.trait_type,
              value: a.value,
            })
          ),
      } as EthereumNft);
    }

    //
    // Sort for consistent UI presentation.
    //
    return [...collections.values()]
      .sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0))
      .map((c) => {
        return {
          ...c,
          items: c.items.sort((a: EthereumNft, b: EthereumNft) =>
            a.id > b.id ? 1 : b.id > a.id ? -1 : 0
          ),
        };
      });
  },
});
