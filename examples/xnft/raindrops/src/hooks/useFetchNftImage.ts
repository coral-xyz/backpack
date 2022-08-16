import React, { useEffect } from "react";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";

const fetchNftImage = async (
  metadata: Metadata,
  callback: (nft: string | null) => void
) => {
  const imageMetadata = await fetch(metadata.data.uri);
  if (!imageMetadata) {
    console.log("fetchNFTImage no image metadata");
    return callback(null);
  }
  const imageMetadataJson = await imageMetadata.json();

  console.log("Image url:", imageMetadataJson.image);
  callback(imageMetadataJson.image);
};

export default (metadata: Metadata | null) => {
  const [imageUrl, setImageUrl] = React.useState<String | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  useEffect(() => {
    if (metadata) {
      setLoading(true);
      fetchNftImage(metadata, (imageUrl) => {
        setImageUrl(imageUrl);
        setLoading(false);
      });
    } else {
      setImageUrl(null);
      setLoading(false);
    }
  }, [metadata]);
  return { loading, imageUrl };
};
