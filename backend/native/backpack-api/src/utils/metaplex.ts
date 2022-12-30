import { Metaplex } from "@metaplex-foundation/js";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

const connection = new Connection("https://swr.xnfts.dev/rpc-proxy");
const metaplex = new Metaplex(connection);

export const validateOwnership = async (
  mint: string,
  collection: string,
  owner: string
) => {
  try {
    const nft = await metaplex
      .nfts()
      .findByMint({ mintAddress: new PublicKey(mint) });
    const largestAccounts = await connection.getTokenLargestAccounts(
      new PublicKey(mint)
    );
    const largestAccountInfo = await connection.getParsedAccountInfo(
      largestAccounts.value[0].address
    );
    return (
      nft.collection.address.toString() === collection &&
      largestAccountInfo?.value?.data?.parsed?.info?.owner
    );
  } catch (e) {
    console.log(e);
    return false;
  }
};
