import { useState } from "react";
import {
  confirmTransaction,
  getLogger,
  isCardinalWrappedToken,
  isCreatorStandardToken,
  isOpenCreatorProtocol,
  isProgrammableNftToken,
  SOL_NATIVE_MINT,
  Solana,
} from "@coral-xyz/common";
import { PublicKey } from "@solana/web3.js";
import type { BigNumber } from "ethers";

import { useSolanaTokenMint } from "./index";
import { useSolanaCtx } from "./useSolanaConnection";

type Token = any; // TODO;
export type SolTransactionStep = "confirm" | "sending" | "complete" | "error";

const logger = getLogger("send-solana-transaction");

export function useSolanaTransaction({
  token,
  destinationAddress,
  amount,
  onComplete,
}: {
  token: Token;
  destinationAddress: string;
  amount: BigNumber;
  onComplete: (txId: string) => void;
}): {
  txSignature: string | null;
  onConfirm: () => Promise<void>;
  cardType: SolTransactionStep;
  error: string;
} {
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const solanaCtx = useSolanaCtx();
  const [error, setError] = useState(
    "Error 422. Transaction time out. Runtime error. Reticulating splines."
  );
  const [cardType, setCardType] = useState<SolTransactionStep>("confirm");
  const mintInfo = useSolanaTokenMint({
    publicKey: solanaCtx.walletPublicKey.toString(),
    tokenAddress: token.address,
  });

  const onConfirm = async () => {
    setCardType("sending");
    //
    // Send the tx.
    //
    let txSig;

    try {
      const mintId = new PublicKey(token.mint?.toString() as string);
      if (token.mint === SOL_NATIVE_MINT.toString()) {
        txSig = await Solana.transferSol(solanaCtx, {
          source: solanaCtx.walletPublicKey,
          destination: new PublicKey(destinationAddress),
          amount: amount.toNumber(),
        });
      } else if (
        await isProgrammableNftToken(
          solanaCtx.connection,
          token.mint?.toString() as string
        )
      ) {
        txSig = await Solana.transferProgrammableNft(solanaCtx, {
          destination: new PublicKey(destinationAddress),
          mint: new PublicKey(token.mint!),
          programId: new PublicKey(mintInfo.programId!),
          amount: amount.toNumber(),
          decimals: token.decimals,
          source: new PublicKey(token.address),
        });
      }
      // Use an else here to avoid an extra request if we are transferring sol native mints.
      else {
        const ocpMintState = await isOpenCreatorProtocol(
          solanaCtx.connection,
          mintId,
          mintInfo
        );
        if (ocpMintState !== null) {
          txSig = await Solana.transferOpenCreatorProtocol(
            solanaCtx,
            {
              destination: new PublicKey(destinationAddress),
              amount: amount.toNumber(),
              mint: new PublicKey(token.mint!),
              programId: new PublicKey(mintInfo.programId!),
            },
            ocpMintState
          );
        } else if (isCreatorStandardToken(mintId, mintInfo)) {
          txSig = await Solana.transferCreatorStandardToken(solanaCtx, {
            destination: new PublicKey(destinationAddress),
            mint: new PublicKey(token.mint!),
            programId: new PublicKey(mintInfo.programId!),
            amount: amount.toNumber(),
            decimals: token.decimals,
          });
        } else if (
          await isCardinalWrappedToken(solanaCtx.connection, mintId, mintInfo)
        ) {
          txSig = await Solana.transferCardinalManagedToken(solanaCtx, {
            destination: new PublicKey(destinationAddress),
            mint: new PublicKey(token.mint!),
            programId: new PublicKey(mintInfo.programId!),
            amount: amount.toNumber(),
            decimals: token.decimals,
          });
        } else {
          txSig = await Solana.transferToken(solanaCtx, {
            destination: new PublicKey(destinationAddress),
            mint: new PublicKey(token.mint!),
            programId: new PublicKey(mintInfo.programId!),
            amount: amount.toNumber(),
            decimals: token.decimals,
          });
        }
      }
    } catch (err: any) {
      logger.error("solana transaction failed", err);
      setError(err.toString());
      setCardType("error");
      return;
    }

    setTxSignature(txSig);

    //
    // Confirm the tx.
    //
    try {
      await confirmTransaction(
        solanaCtx.connection,
        txSig,
        solanaCtx.commitment === "finalized" ? "finalized" : "confirmed"
      );
      setCardType("complete");
      if (onComplete) onComplete(txSig);
    } catch (err: any) {
      logger.error("unable to confirm", err);
      setError(err.toString());
      setCardType("error");
    }
  };

  return { txSignature, onConfirm, cardType, error };
}
