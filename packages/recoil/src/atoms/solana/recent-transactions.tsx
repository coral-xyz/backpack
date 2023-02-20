import { BACKEND_API_URL } from "@coral-xyz/common";
import type {
  Connection,
  ParsedTransactionWithMeta,
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
    console.error(e);
    return [];
  }
}

export async function fetchNftMetadata(mintID: string): Promise<any> {
  try {
    const nftmeta = await fetch(
      `${BACKEND_API_URL}/tx-parsing/nftMetadata?mint=${mintID}`
    );
    const json = await nftmeta.json();
    return json.metadata;
  } catch (err) {
    console.error(err);
    return undefined;
  }
}
