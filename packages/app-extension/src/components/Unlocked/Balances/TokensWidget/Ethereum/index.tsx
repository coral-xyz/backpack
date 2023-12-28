import { useEffect, useState } from "react";
import { Blockchain, getLogger } from "@coral-xyz/common";
import {
  blockchainClientAtom,
  secureUserAtom,
  useAvatarUrl,
  useEthereumCtx,
} from "@coral-xyz/recoil";
import { type BigNumber } from "ethers";
import { useRecoilValue } from "recoil";

import { Error, Sending } from "../Send";

const logger = getLogger("send-ethereum-confirmation-card");

// Note: have not tested this for non main Ethereum chains (e.g. Polygon).
export function SendEvmConfirmationCard({
  token,
  amount,
  onComplete,
  onClose,
  onViewBalances,
  blockchain,
  destinationAddress,
  destinationUser,
}: {
  token: {
    id: string;
    address: string;
    logo: string;
    decimals: number;
    // For ERC721 sends
    tokenId?: string;
    ticker?: string;
    name?: string;
  };
  destinationUser?: {
    username: string;
    image: string;
  };
  destinationAddress: string;
  amount: BigNumber;
  onComplete?: () => void;
  onClose?: () => void;
  onViewBalances?: () => void;
  blockchain: Blockchain;
}) {
  const ethereumCtx = useEthereumCtx();
  const user = useRecoilValue(secureUserAtom);
  const avatar = useAvatarUrl(120, user.user.username);
  const blockchainClient = useRecoilValue(
    blockchainClientAtom(Blockchain.ETHEREUM)
  );
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cardType, setCardType] = useState<
    "confirm" | "sending" | "complete" | "error" | "confirming"
  >("confirm");

  // TODO: prefetch blockhash to keep cache warm
  // if (blockchainClient.config.Blockchain === Blockchain.SOLANA) {
  //   (blockchainClient as SolanaClient).getBlockhash();
  // }

  const onConfirm = async () => {
    // onOpen?.();
    setCardType("confirm");
    setError(null);
    try {
      const temporaryAssetId = JSON.stringify(token);
      const publicKey = ethereumCtx.walletPublicKey;
      const from = {
        publicKey,
        username: user.user.username,
        image: avatar,
        walletName:
          user.publicKeys.platforms.ethereum?.publicKeys[publicKey]?.name,
      };
      const to = {
        publicKey: destinationAddress,
        username: destinationUser?.username,
        image: destinationUser?.image,
      };
      const transactionHash = await blockchainClient!.transferAsset({
        assetId: temporaryAssetId,
        from,
        to,
        amount: amount.toString(),
      });
      setCardType("sending");
      //
      // Confirm the tx.
      //
      setCardType("confirming");
      setTxSignature(transactionHash);
      const confirmed = await blockchainClient!.confirmTransaction(
        transactionHash
      );

      setCardType("complete");

      if (onComplete && confirmed) {
        onComplete();
      }
    } catch (err: Error | any) {
      const error = err.message;

      logger.error("Ethereum transaction failed", err);
      if (error.includes("Approval Denied") || error.includes("Popup Closed")) {
        // close secure-ui and error modal
        onClose?.();
      } else {
        setError(error);
        setCardType("error");
      }
    }
  };

  useEffect(() => {
    void onConfirm();
  }, []);

  return (
    <>
      {["sending", "confirming"].includes(cardType) ? (
        <Sending
          blockchain={blockchain}
          isComplete={false}
          amount={amount}
          token={token}
          signature={txSignature ?? undefined}
        />
      ) : cardType === "complete" ? (
        <Sending
          blockchain={blockchain}
          isComplete
          amount={amount}
          token={token}
          signature={txSignature!}
          onViewBalances={onViewBalances}
        />
      ) : cardType === "error" && error ? (
        <Error
          blockchain={blockchain}
          signature={txSignature!}
          onRetry={onConfirm}
          error={error}
        />
      ) : (
        // XXX: A shameless hack to hide the mini drawer and its backdrop
        //      when there's nothing to be rendered inside it
        <style>{`#with-mini-drawer { display: none !important; }`}</style>
      )}
    </>
  );
}
