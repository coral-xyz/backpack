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
        };
      }[];
    };
  };
};

export type ListItem = {
  key: string;
  title: string;
  type: "collection" | "nft";
  numItems: number;
  images: string[];
};

export function convertNftDataToFlatlist(data: GraphQLWalletData): ListItem[] {
  const nfts = data.wallet.nfts.edges.map((edge) => edge.node);

  // Group the nodes by collection
  const collectionMap = new Map();
  nfts.forEach((nft) => {
    if (!nft.collection) {
      // If there's no collection, use the node name as the key
      const key = nft.address;
      if (!collectionMap.has(key)) {
        collectionMap.set(key, {
          title: nft.name,
          type: "nft",
          numItems: 1,
          id: nft.id,
          images: [nft.image],
        });
      } else {
        const collection = collectionMap.get(key);
        collection.numItems++;
        collection.images.push(nft.image);
      }
    } else {
      // If there is a collection, use the collection address as the key
      const key = nft.collection.address;
      if (!collectionMap.has(key)) {
        collectionMap.set(key, {
          title: nft.collection.name,
          type: "collection",
          numItems: 1,
          id: nft.collection.id,
          images: [nft.image],
        });
      } else {
        const collection = collectionMap.get(key);
        collection.numItems++;
        collection.images.push(nft.image);
      }
    }
  });

  // Convert the map to an array
  const collections = Array.from(collectionMap.values());

  // Sort the collections by the number of items (descending)
  collections.sort((a, b) => b.numItems - a.numItems);

  // Return the converted data
  return collections.map((collection) => ({
    key: collection.id,
    title: collection.title,
    type: collection.type,
    numItems: collection.numItems,
    images: collection.images,
  }));
}
