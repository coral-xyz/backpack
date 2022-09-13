import {
  ParsedTransactionWithMeta,
  Connection,
  PublicKey,
} from "@solana/web3.js";

export async function fetchRecentSolanaTransactions(
  connection: Connection,
  publicKey: PublicKey
): Promise<Array<ParsedTransactionWithMeta>> {
  try {
    const resp = await connection.getConfirmedSignaturesForAddress2(publicKey, {
      limit: 15,
    });
    const signatures = resp.map((s) => s.signature);
    const transactions: Array<ParsedTransactionWithMeta | null> =
      await connection.getParsedTransactions(signatures);
    return transactions.filter(
      (tx) => tx !== null
    ) as Array<ParsedTransactionWithMeta>;
  } catch (err) {
    console.error(err);
    return [];
  }
}
