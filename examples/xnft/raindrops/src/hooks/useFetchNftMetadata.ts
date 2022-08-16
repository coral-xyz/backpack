import React, { useEffect } from "react";
import ReactXnft, { useConnection } from "react-xnft";
import { PublicKey, Connection } from "@solana/web3.js";
import {
  Metadata,
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";

const getTokenMetadataPDA = async (mint: PublicKey): Promise<PublicKey> => {
  console.log("mint", mint);
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )
  )[0];
};

const fetchNftMetadata = async (
  connection: Connection,
  address: PublicKey,
  callback: (nft: Metadata | null) => void
) => {
  const metadataAccountAddress = await getTokenMetadataPDA(address);
  const metadataAccount = await connection.getAccountInfo(
    metadataAccountAddress
  );
  if (!metadataAccount) {
    return callback(null);
  }

  const parsedMetadataAccount = Metadata.fromAccountInfo(metadataAccount);
  callback(parsedMetadataAccount[0]);
};

export default (address: PublicKey) => {
  const connection = useConnection();
  const [metadata, setMetadata] = React.useState<Metadata | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  useEffect(() => {
    if (address) {
      setLoading(true);
      fetchNftMetadata(connection, address, (metadata) => {
        setMetadata(metadata);
        setLoading(false);
      });
    } else {
      setMetadata(null);
      setLoading(false);
    }
  }, [connection, address]);
  return { loading, metadata };
};
