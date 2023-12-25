import type {
  Connection,
  Finality,
  GetVersionedTransactionConfig,
} from "@solana/web3.js";

export async function confirmTransaction(
  c: Connection,
  txSig: string,
  commitmentOrConfig?: GetVersionedTransactionConfig | Finality
): Promise<ReturnType<(typeof c)["getParsedTransaction"]>> {
  return new Promise(async (resolve, reject) => {
    setTimeout(
      () =>
        reject(new Error(`30 second timeout: unable to confirm transaction`)),
      30000
    );
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const config = {
      // Support confirming Versioned Transactions
      maxSupportedTransactionVersion: 0,
      ...(typeof commitmentOrConfig === "string"
        ? {
            commitment: commitmentOrConfig,
          }
        : commitmentOrConfig),
    };

    let tx = await c.getParsedTransaction(txSig, config);
    while (tx === null) {
      tx = await c.getParsedTransaction(txSig, config);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    resolve(tx);
  });
}
