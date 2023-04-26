import { Metaplex } from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";

const connection = new Connection(
  process.env.OVERRIDE_RPC_URL || "https://swr.xnfts.dev/rpc-proxy"
);
const metaplex = new Metaplex(connection);

export const validateOwnership = async (
  mint: string,
  collection: string
  // centralizedGroup: string,
  // owner: string
) => {
  try {
    //TODO: make use of centralizedGroup group here
    // to do attribute wide auth
    const nft = metaplex
      .nfts()
      .findByMint({ mintAddress: new PublicKey(mint) });
    await nft.run();
    const largestAccounts = await connection.getTokenLargestAccounts(
      new PublicKey(mint)
    );

    const largestAccountInfo = await connection.getParsedAccountInfo(
      largestAccounts.value[0]?.address
    );
    return (
      nft.getResult().collection.address.toString() === collection &&
      largestAccountInfo?.value?.data?.parsed?.info?.owner
    );
  } catch (e) {
    console.log(e);
    return false;
  }
};

export const getNftOwner = async (mint: string) => {
  const nft = metaplex.nfts().findByMint({ mintAddress: new PublicKey(mint) });
  await nft.run();
  const largestAccounts = await connection.getTokenLargestAccounts(
    new PublicKey(mint)
  );

  const largestAccountInfo = await connection.getParsedAccountInfo(
    largestAccounts.value[0]?.address
  );

  return largestAccountInfo?.value?.data?.parsed?.info?.owner || "";
};
