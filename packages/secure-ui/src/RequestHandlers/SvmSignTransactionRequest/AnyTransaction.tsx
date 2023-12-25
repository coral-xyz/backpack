import type { QueuedUiRequest } from "../../_atoms/requestAtoms";
import type { TransactionOverrides } from "../../_sharedComponents/SolanaTransactionDetails";

import { useEffect, useState } from "react";

import { Blockchain } from "@coral-xyz/common";
import { useSolanaTxData } from "@coral-xyz/recoil";
import { SolanaClient } from "@coral-xyz/secure-clients";
import { PrimaryButton } from "@coral-xyz/tamagui";
import { useRecoilValueLoadable } from "recoil";

import { TransactionSettings } from "./TransactionSettings";
import { useFetchSolanaBlowfishEvaluation } from "./useFetchSolanaBlowfishEvaluation";
import { RequireUserUnlocked } from "../../RequireUserUnlocked/RequireUserUnlocked";
import { solanaTransactionMutLockedNftsAtom } from "../../_atoms/solanaTransactionMutLockedNftsAtom";
import {
  BlowfishTransactionDetails,
  BlockingWarning,
  BlowfishCrossChainResult,
} from "../../_sharedComponents/BlowfishEvaluation";
import { Loading } from "../../_sharedComponents/Loading";
import { OriginUserHeader } from "../../_sharedComponents/OriginHeader";
import { RequestConfirmation } from "../../_sharedComponents/RequestConfirmation";
import { SolanaTransactionDetails } from "../../_sharedComponents/SolanaTransactionDetails";
import { Warning } from "../../_sharedComponents/Warning";

export function AnyTransaction({
  currentRequest,
}: {
  currentRequest: QueuedUiRequest<"SECURE_SVM_SIGN_TX">;
}) {
  const notBackpack = ["browser", "xnft"].includes(
    currentRequest.event.origin.context
  );
  const solanaTxData = useSolanaTxData(currentRequest.request.tx);
  const [noGas] = useState(false);
  const [blowfishError, setBlowfishError] = useState(false);
  const mutableLockedNftsLoadable = useRecoilValueLoadable(
    solanaTransactionMutLockedNftsAtom(currentRequest.request)
  );
  const mutableLockedNfts = mutableLockedNftsLoadable.getValue() ?? [];
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

  const [transactionOverrides, setTransactionOverrides] =
    useState<TransactionOverrides>({
      priorityFee:
        solanaTxData.solanaFeeConfig?.config?.priorityFee?.toString() || "0",
      computeUnits:
        solanaTxData.solanaFeeConfig?.config?.computeUnits?.toString() || "0",
      disableFeeConfig: solanaTxData.solanaFeeConfig?.disabled ?? false,
    });

  useEffect(() => {
    const cfg = solanaTxData.solanaFeeConfig;
    if (cfg) {
      setTransactionOverrides({
        computeUnits: cfg.config?.computeUnits?.toString() ?? "0",
        priorityFee: cfg.config?.priorityFee?.toString() ?? "0",
        disableFeeConfig: cfg.disabled,
      });
    }
  }, [solanaTxData.solanaFeeConfig]);

  const resetOverrides = () => {
    setTransactionOverrides({
      priorityFee:
        solanaTxData.solanaFeeConfig?.config?.priorityFee?.toString() || "0",
      computeUnits:
        solanaTxData.solanaFeeConfig?.config?.computeUnits?.toString() || "0",
      disableFeeConfig: solanaTxData.solanaFeeConfig?.disabled ?? false,
    });
  };

  const onApprove = () => {
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
          message: `Collection ${lockedNft.collection.name} is locked. This transaction would affect ${lockedNft.name}. If this is intentional, unlock the collection first.`,
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
  if (noGas === true) {
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
                solanaTxData.loading ||
                mutableLockedNftsLoadable.state === "loading"
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
                kind: "somehting",
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
          <SolanaTransactionDetails
            setTransactionOverrides={setTransactionOverrides}
            transactionOverrides={transactionOverrides}
            solanaTxData={solanaTxData}
            title="Transaction Details:"
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
            solanaTxData.version === "legacy"
              ? [
                  <TransactionSettings
                    overrides={transactionOverrides}
                    resetOverrides={resetOverrides}
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
