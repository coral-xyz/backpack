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
