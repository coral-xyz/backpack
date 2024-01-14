import type { QueuedUiRequest } from "../../_atoms/requestAtoms";

import { useState } from "react";

import { Blockchain } from "@coral-xyz/common";
import { SolanaClient } from "@coral-xyz/secure-clients";
import { PrimaryButton } from "@coral-xyz/tamagui";
import {
  useRecoilStateLoadable,
  useRecoilValue,
  useRecoilValueLoadable,
} from "recoil";

import { TransactionSettings } from "./TransactionSettings";
import { useFetchSolanaBlowfishEvaluation } from "./useFetchSolanaBlowfishEvaluation";
import { RequireUserUnlocked } from "../../RequireUserUnlocked/RequireUserUnlocked";
import { solanaPublicKeyHasGas } from "../../_atoms/solanaTransactionAtom";
import { solanaTransactionMutLockedNftsAtom } from "../../_atoms/solanaTransactionMutLockedNftsAtom";
import { solanaTxIsMutableAtom } from "../../_atoms/solanaTxIsMutableAtom";
import { solanaTxOverridesAtom } from "../../_atoms/solanaTxOverridesAtom";
import {
  BlowfishTransactionDetails,
  BlockingWarning,
  BlowfishCrossChainResult,
} from "../../_sharedComponents/BlowfishEvaluation";
import { Loading } from "../../_sharedComponents/Loading";
import { OriginUserHeader } from "../../_sharedComponents/OriginHeader";
import { RequestConfirmation } from "../../_sharedComponents/RequestConfirmation";
import { Warning } from "../../_sharedComponents/Warning";

export function AnyTransaction({
  currentRequest,
}: {
  currentRequest: QueuedUiRequest<"SECURE_SVM_SIGN_TX">;
}) {
  const notBackpack = ["browser", "xnft"].includes(
    currentRequest.event.origin.context
  );
  // const solanaTxData = useSolanaTxData(currentRequest.request.tx);
  const [blowfishError, setBlowfishError] = useState(false);
  const isTxMutable = useRecoilValue(
    solanaTxIsMutableAtom(currentRequest.request)
  );
  const hasGasLoadable = useRecoilValueLoadable(
    solanaPublicKeyHasGas(currentRequest.request)
  );
  const mutableLockedNftsLoadable = useRecoilValueLoadable(
    solanaTransactionMutLockedNftsAtom(currentRequest.request)
  );
  const hasGas = hasGasLoadable.valueMaybe() ?? true;
  const mutableLockedNfts = mutableLockedNftsLoadable.valueMaybe() ?? [];
  const blowfishEvaluation = useFetchSolanaBlowfishEvaluation(
    SolanaClient.config.blowfishUrl,
    [currentRequest.request.tx],
    currentRequest.event.origin.address,
    currentRequest.request.publicKey,
    (error) => {
      setBlowfishError(true);
      console.error(error);
    }
  );

  const [transactionOverridesLoadable, setTransactionOverrides] =
    useRecoilStateLoadable(solanaTxOverridesAtom(currentRequest.request));
  const transactionOverrides = transactionOverridesLoadable.valueMaybe();

  const onApprove = () => {
    if (!transactionOverrides) {
      console.error("unable to fetch or parse transaction data");
      return;
    }
    currentRequest.respond({
      transactionOverrides,
      confirmed: true,
    });
  };

  const onDeny = () => currentRequest.error(new Error("Approval Denied"));

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
          message: `Collection ${lockedNft.collection?.name} is locked. This transaction would affect ${lockedNft?.name}. If this is intentional, unlock the collection first.`,
        }}
        onIgnore={null}
        onDeny={onDeny}
      />
    );
  }

  const customWarnings: BlowfishCrossChainResult["warnings"] = [];
  if (mutableLockedNftsLoadable.state === "hasError") {
    customWarnings.push({
      message:
        "Failed to verify locked collections. This transaction MAY affect NFTs you locked. Proceed with caution.",
      severity: "WARNING" as const,
      kind: "error",
    });
  }
  if (hasGas !== true) {
    customWarnings.push({
      message:
        "Not enought SOL to pay for gas. Top up your wallet and try again.",
      severity: "CRITICAL" as const,
      kind: "error",
    });
  }

  return (
    <RequireUserUnlocked
      onReset={() => currentRequest.error(new Error("Login Failed"))}
    >
      {blowfishEvaluation.isLoading ? (
        <Loading />
      ) : blowfishError ||
        blowfishEvaluation.error ||
        !blowfishEvaluation.normalizedEvaluation ? (
          <RequestConfirmation
            title="Confirm Transaction"
            rightButton={
              <PrimaryButton
                disabled={
                transactionOverridesLoadable.state === "loading" ||
                mutableLockedNftsLoadable.state === "loading" ||
                hasGasLoadable.state === "loading" ||
                !transactionOverrides
              }
                label="Approve"
                onPress={onApprove}
            />
          }
            onApprove={onApprove}
            onDeny={onDeny}
        >
            {notBackpack ? (
              <Warning
                warning={{
                severity: "WARNING",
                kind: "something",
                message:
                  "There was a problem fetching transaction details. Proceed at your own risk.",
              }}
            />
          ) : null}
            <OriginUserHeader
              origin={currentRequest.event.origin}
              publicKey={currentRequest.request.publicKey}
              blockchain={Blockchain.SOLANA}
          />
          </RequestConfirmation>
      ) : (
        <BlowfishTransactionDetails
          origin={currentRequest.event.origin}
          signerPublicKey={currentRequest.request.publicKey}
          onDeny={onDeny}
          onApprove={onApprove}
          evaluation={blowfishEvaluation.normalizedEvaluation}
          customWarnings={customWarnings}
          prepend={
            isTxMutable && transactionOverrides
              ? [
                <TransactionSettings
                  key="TransactionSettings"
                  overrides={transactionOverrides}
                  setOverrides={setTransactionOverrides}
                  />,
                ]
              : undefined
          }
        />
      )}
    </RequireUserUnlocked>
  );
}
