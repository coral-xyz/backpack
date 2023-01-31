import { BACKEND_API_URL } from "@coral-xyz/common";

export async function fetchRecentSolanaTransactionDetails(
  publicKey: string
): Promise<any> {
  try {
    const response = await fetch(
      `${BACKEND_API_URL}/tx-parsing/transactions?publicKey=${publicKey}`
    );

    const json = await response.json();
    return json.transactions;
  } catch (e) {
    return [];
  }
}

export async function fetchNFTMetaData(mintID: string): Promise<any> {
  try {
    const nftmeta = await fetch(
      `${BACKEND_API_URL}/tx-parsing/nftMetadata?mint=${mintID}`
    );
    const json = await nftmeta.json();
    return json.metadata;
  } catch (err) {
    console.error(err);
    return;
  }
}
