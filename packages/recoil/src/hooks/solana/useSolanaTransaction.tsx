import { useState } from "react";
import { Blockchain, getLogger } from "@coral-xyz/common";
import { BigNumber } from "ethers";
import { useRecoilValue } from "recoil";

import { blockchainClientAtom, secureUserAtom } from "../../atoms";
import { useAvatarUrl } from "../avatar";

import { useSolanaTokenMint } from "./index";
import { useSolanaCtx } from "./useSolanaConnection";

type Token = any; // TODO;

export type SolTransactionStep =
  | "confirm"
  | "sending"
  | "confirming"
  | "complete"
  | "error";

const logger = getLogger("send-solana-transaction");

type UseSolanaTransactionOptions = {
  token: Token;
  destinationAddress: string;
  destinationUser?: {
    username: string;
    walletName?: string;
    image: string;
  };
  amount: BigNumber;
  onComplete: (txId: string) => void;
  ctx?: {
    publicKey: string;
    blockchain: Blockchain;
  };
  onClose?: () => void;
  onOpen?: () => void;
};

type UseSolanaTransactionResponse = {
  txSignature: string | null;
  onConfirm: () => Promise<void>;
  cardType: SolTransactionStep;
  error: string | null;
};

export function useSolanaTransaction({
  token,
  destinationAddress,
  destinationUser,
  amount,
  onComplete,
  ctx,
  onClose,
  onOpen,
}: UseSolanaTransactionOptions): UseSolanaTransactionResponse {
  destinationUser;
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const solanaCtx = useSolanaCtx(ctx ? ctx.publicKey : undefined);
  const [error, setError] = useState<string | null>(null);
  const [cardType, setCardType] = useState<SolTransactionStep>("confirm");
  const user = useRecoilValue(secureUserAtom)!;
  const userAvatar = useAvatarUrl(120, user.user.username);
  const blockchainClient = useRecoilValue(
    blockchainClientAtom(Blockchain.SOLANA)
  )!;
  const mintInfo = useSolanaTokenMint({
    publicKey: solanaCtx.walletPublicKey.toString(),
    tokenAddress: token.token,
  });
  token.decimals ??= mintInfo?.decimals;

  // TODO: prefetch blockhash to keep cache warm
  // if (blockchainClient.config.Blockchain === Blockchain.SOLANA) {
  //   (blockchainClient as SolanaClient).getBlockhash();
  // }

  const publicKey = solanaCtx.walletPublicKey.toString();
  const temporaryAssetId = JSON.stringify(
    { token, mintInfo },
    (_key, value) => {
      if (typeof value === "bigint" || value instanceof BigNumber) {
        return value.toString();
      }
      return value;
    }
  );

  const to = {
    publicKey: destinationAddress,
    ...destinationUser,
  };

  const from = {
    publicKey,
    username: user.user.username,
    walletName: user.publicKeys.platforms.solana?.publicKeys[publicKey]?.name,
    image: userAvatar,
  };

  const amountStr = amount.toString();

  const onConfirm = async () => {
    onOpen?.();
    setCardType("confirm");
    setError(null);
    //
    // Confirm the tx.
    //
    try {
      //
      // Send the tx.
      //
      const txSig = await blockchainClient.transferAsset({
        assetId: temporaryAssetId,
        from,
        to,
        amount: amountStr,
      });

      setCardType("sending");

      setTxSignature(txSig);

      await blockchainClient.confirmTransaction(
        txSig
        // solanaCtx.commitment === "finalized" ? "finalized" : "confirmed"
      );
      setCardType("complete");
      if (onComplete) onComplete(txSig);
    } catch (err: any) {
      const error = err.message;

      logger.error("unable to confirm", err);
      if (error.includes("Approval Denied") || error.includes("Popup Closed")) {
        // close secure-ui and error modal
        onClose?.();
      } else {
        setError(error);
        setCardType("error");
      }
    }
  };

  return { txSignature, onConfirm, cardType, error };
}
