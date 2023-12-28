import { useEffect } from "react";
import type { Blockchain } from "@coral-xyz/common";
import { useSolanaTransaction } from "@coral-xyz/recoil";
import type { BigNumber } from "ethers";

import { Error, Sending } from "../Send";

export function SendSvmConfirmationCard({
  token,
  destinationAddress,
  destinationUser,
  amount,
  onComplete,
  onViewBalances,
  onClose,
  blockchain,
}: {
  token: {
    id: string;
    logo: string;
    decimals: number;
    tokenId?: string;
    mint?: string;
    token?: string;
    compressed?: boolean;
    compressionData?: {
      creatorHash: string;
      dataHash: string;
      leaf: number;
      tree: string;
    };
  };
  destinationAddress: string;
  destinationUser?: {
    username: string;
    walletName?: string;
    image: string;
  };
  amount: BigNumber;
  onComplete?: (txSig?: any) => void;
  onClose?: () => void;
  onViewBalances?: () => void;
  blockchain: Blockchain;
}) {
  const { txSignature, onConfirm, cardType, error } = useSolanaTransaction({
    token,
    destinationAddress,
    destinationUser,
    amount,
    onComplete: (txid) => {
      onComplete?.(txid);
    },
    onClose: () => {
      onClose?.();
    },
  });

  useEffect(() => {
    void onConfirm();
  }, []);

  return (
    <>
      {["sending", "confirming"].includes(cardType) ? (
        <Sending
          isComplete={false}
          blockchain={blockchain}
          amount={amount}
          token={token}
          signature={txSignature ?? undefined}
        />
      ) : cardType === "complete" ? (
        <Sending
          isComplete
          blockchain={blockchain}
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
