import type { QueuedUiRequest } from "../_atoms/requestAtoms";

import { useState } from "react";

import { Blockchain } from "@coral-xyz/common";
import { secureUserAtom } from "@coral-xyz/recoil";
import { SolanaClient } from "@coral-xyz/secure-clients";
import { useRecoilValue, useRecoilValueLoadable } from "recoil";

import { useFetchSolanaBlowfishEvaluation } from "./SvmSignTransactionRequest/useFetchSolanaBlowfishEvaluation";
import { RequireUserUnlocked } from "../RequireUserUnlocked/RequireUserUnlocked";
import { solanaAllMutatedTransactionAtom } from "../_atoms/solanaMutatedTransactionAtom";
import { solanaTransactionMutLockedNftsAtom } from "../_atoms/solanaTransactionMutLockedNftsAtom";
import {
  solanaAllTxOverridesAtom,
  solanaTxOverridesAtom,
} from "../_atoms/solanaTxOverridesAtom";
import {
  BlowfishTransactionDetails,
  BlockingWarning,
} from "../_sharedComponents/BlowfishEvaluation";
import { IsColdWalletWarning } from "../_sharedComponents/IsColdWalletWarning";
import { Loading } from "../_sharedComponents/Loading";

export function SvmSignAllTransactionsRequest({
  currentRequest,
}: {
  currentRequest: QueuedUiRequest<"SECURE_SVM_SIGN_ALL_TX">;
}) {
  const user = useRecoilValue(secureUserAtom);
  const [blowfishError, setBlowfishError] = useState(false);
  const solanaAllMutatedTransactionLoadable = useRecoilValueLoadable(
    solanaAllMutatedTransactionAtom(currentRequest.request)
  );
  const mutableLockedNftsLoadable = useRecoilValueLoadable(
    solanaTransactionMutLockedNftsAtom(currentRequest.request)
  );
  const mutableLockedNfts = mutableLockedNftsLoadable.getValue() ?? [];
  const mutatedTransactions = solanaAllMutatedTransactionLoadable.getValue();
  const blowfishEvaluation = useFetchSolanaBlowfishEvaluation(
    SolanaClient.config.blowfishUrl,
    currentRequest.request.txs,
    currentRequest.event.origin.address,
    currentRequest.request.publicKey,
    (error) => {
      setBlowfishError(true);
      console.error(error);
    }
  );

  const [showSimulationFailed, setShowSimulationFailed] = useState(true);

  const onApprove = () => {
    if (!mutatedTransactions) {
      console.error("unable to fetch or parse transaction data");
      return;
    }

    currentRequest.respond({
      txs: mutatedTransactions,
      confirmed: true,
    });
  };

  const onDeny = () => currentRequest.error(new Error("Approval Denied"));

  const publicKeyInfo =
    user.publicKeys.platforms[Blockchain.SOLANA]?.publicKeys[
      currentRequest.request.publicKey
    ];

  const [coldWalletWarningIgnored, setColdWalletWarningIgnored] =
    useState(false);
  if (
    !coldWalletWarningIgnored &&
    publicKeyInfo?.isCold &&
    ["xnft", "browser"].includes(currentRequest.event.origin.context)
  ) {
    return (
      <IsColdWalletWarning
        origin={currentRequest.event.origin.address}
        onDeny={() => currentRequest.error(new Error("Approval Denied"))}
        onIgnore={() => setColdWalletWarningIgnored(true)}
      />
    );
  }

  if (
    mutableLockedNftsLoadable.state === "hasValue" &&
    mutableLockedNfts.length > 0
  ) {
    const lockedNft = mutableLockedNfts[0];
    return (
      <BlockingWarning
        warning={{
          severity: "CRITICAL",
          kind: "warning",
          message: `Collection ${lockedNft.collection.name} is locked. This transaction would affect ${lockedNft.name}. If this is intentional, unlock the collection first.`,
        }}
        onDeny={onDeny}
      />
    );
  }

  const customWarnings =
    mutableLockedNftsLoadable.state === "hasError"
      ? [
          {
            message:
              "Failed to verify locked collections. This transaction MAY affect NFTs you locked. Proceed with caution.",
            severity: "WARNING" as const,
            kind: "error",
          },
        ]
      : [];

  return (
    <RequireUserUnlocked
      onReset={() => currentRequest.error(new Error("Login Failed"))}
    >
      {blowfishEvaluation.isLoading ||
      mutableLockedNftsLoadable.state === "loading" ? (
        <Loading />
      ) : (blowfishError ||
          blowfishEvaluation.error ||
          !blowfishEvaluation.normalizedEvaluation) &&
        showSimulationFailed ? (
          <BlockingWarning
            title="Simulation failed"
            warning={{
            severity: "WARNING",
            kind: "error",
            message: "Please try again.",
          }}
            onIgnore={() => setShowSimulationFailed(false)}
            onDeny={onDeny}
        />
      ) : (
        <BlowfishTransactionDetails
          origin={currentRequest.event.origin}
          signerPublicKey={currentRequest.request.publicKey}
          onDeny={onDeny}
          onApprove={onApprove}
          evaluation={blowfishEvaluation.normalizedEvaluation}
          customWarnings={customWarnings}
        />
      )}
    </RequireUserUnlocked>
  );
}
