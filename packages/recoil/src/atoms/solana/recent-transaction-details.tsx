export async function fetchRecentSolanaTransactionDetails(
  publicKey: string
): Promise<any> {
  try {
    const url = `https://api.helius.xyz/v0/addresses/${publicKey}/transactions?api-key=${process.env.HELIUS_API_KEY}`;

    const res = await fetch(url)
      .then(async (response) => {
        const json = await response.json();

        return json;
      })
      .catch((e) => {
        console.error(e);
      });

    return res;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function fetchNFTMetaData(mintID: string): Promise<any> {
  try {
    const nftmeta = await fetch(
      `https://api.helius.xyz/v0/tokens/metadata?api-key=${process.env.HELIUS_API_KEY}`,
      {
        method: "POST",
        body: JSON.stringify({
          mintAccounts: [mintID],
        }),
      }
    )
      .then(async (response) => {
        const json = await response.json();
        return json[0];
      })
      .catch((e) => {
        console.error(e);
      });

    return nftmeta;
  } catch (err) {
    console.error(err);
    return;
  }
}
