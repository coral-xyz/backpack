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
    // console.log(json, "here we go again");
  } catch (e) {
    return [];
  }
}

export async function fetchNFTMetaData(mintID: string): Promise<any> {
  try {
    const nftmeta = await fetch(`${BACKEND_API_URL}/tx-parsing/nftMetadata`, {
      method: "POST",
      body: JSON.stringify({
        mintAccounts: [mintID],
      }),
    });
    const json = await nftmeta.json();
    console.log(json, "here it is");
    return json;
  } catch (err) {
    console.error(err);
    return;
  }
}
