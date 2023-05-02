// TODO auto-generated once off plaane
type GraphQLWalletData = {
  wallet: {
    nfts: {
      edges: {
        node: {
          id: string;
          image: string;
          name: string;
          address: string;
          collection: {
            address: string;
            id: string;
            image: string;
            name: string;
            verified: true;
          };
          attributes: { trait: string; value: string }[];
          description: string;
        };
      }[];
    };
  };
};

export type ListItemProps = {
  id: string;
  type: "collection" | "nft";
  name: string;
  numItems: number;
  images: string[];
  attributes: { trait: string; value: string }[];
  description: string;
  nfts?: any[]; // TODO
};

export function convertNftDataToFlatlist(
  data: GraphQLWalletData
): ListItemProps[] {
  const nfts = data.wallet.nfts.edges.map((edge) => edge.node);

  // Group the nodes by collection
  const collectionMap = new Map();
  nfts.forEach((nft) => {
    if (!nft.collection) {
      // If there's no collection, use the node name as the id
      const id = nft.address;
      if (!collectionMap.has(id)) {
        collectionMap.set(id, {
          id: nft.id,
          type: "nft",
          name: nft.name,
          numItems: 1,
          images: [nft.image],
          attributes: nft.attributes,
          description: nft.description,
        });
      } else {
        const collection = collectionMap.get(id);
        collection.numItems++;
        collection.images.push(nft.image);
      }
    } else {
      // If there is a collection, use the collection address as the id
      const id = nft.collection.address;
      if (!collectionMap.has(id)) {
        collectionMap.set(id, {
          id: nft.collection.id,
          type: "collection",
          name: nft.collection.name,
          numItems: 1,
          images: [nft.image],
          attributes: nft.attributes,
          description: nft.description,
          nfts: [nft],
        });
      } else {
        const collection = collectionMap.get(id);
        collection.numItems++;
        collection.images.push(nft.image);
        collection.nfts.push(nft);
      }
    }
  });

  // Convert the map to an array
  const collections = Array.from(collectionMap.values());

  // Sort the collections by the number of items (descending)
  collections.sort((a, b) => b.numItems - a.numItems);

  // Return the converted data
  return collections.map((collection) => ({
    id: collection.id,
    name: collection.name,
    type: collection.type,
    numItems: collection.numItems,
    images: collection.images,
    attributes: collection.attributes,
    description: collection.description,
    nfts: collection.nfts,
  }));
}
