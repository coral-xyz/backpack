import type { QueuedUiRequest } from "../_atoms/requestAtoms";
import type { TransactionOverrides } from "../_sharedComponents/SolanaTransactionDetails";

import { useState } from "react";

import { Blockchain } from "@coral-xyz/common";
import {
  type TransactionData as TransactionDataType,
  useMultipleTransactionsData,
} from "@coral-xyz/recoil";
import { secureUserAtom } from "@coral-xyz/recoil";
import { SolanaClient } from "@coral-xyz/secure-clients";
import { Stack, StyledText } from "@coral-xyz/tamagui";
import { BigNumber } from "ethers5";
import { useRecoilValue, useRecoilValueLoadable } from "recoil";

import { useFetchSolanaBlowfishEvaluation } from "./SvmSignTransactionRequest/useFetchSolanaBlowfishEvaluation";
import { RequireUserUnlocked } from "../RequireUserUnlocked/RequireUserUnlocked";
import { solanaAllTransactionMutLockedNftsAtom } from "../_atoms/solanaTransactionMutLockedNftsAtom";
import {
  BlowfishTransactionDetails,
  BlockingWarning,
} from "../_sharedComponents/BlowfishEvaluation";
import { IsColdWalletWarning } from "../_sharedComponents/IsColdWalletWarning";
import { Loading } from "../_sharedComponents/Loading";
import { OriginUserHeader } from "../_sharedComponents/OriginHeader";
import { RequestConfirmation } from "../_sharedComponents/RequestConfirmation";
import { SolanaTransactionDetails } from "../_sharedComponents/SolanaTransactionDetails";
import { Warning } from "../_sharedComponents/Warning";

export function SvmSignAllTransactionsRequest({
  currentRequest,
}: {
  currentRequest: QueuedUiRequest<"SECURE_SVM_SIGN_ALL_TX">;
}) {
  const user = useRecoilValue(secureUserAtom);
  const solanaTxsData = useMultipleTransactionsData(
    Blockchain.SOLANA,
    currentRequest.request.txs
  );
  const [blowfishError, setBlowfishError] = useState(false);
  const mutableLockedNftsLoadable = useRecoilValueLoadable(
    solanaAllTransactionMutLockedNftsAtom(currentRequest.request)
  );
  const mutableLockedNfts = mutableLockedNftsLoadable.getValue() ?? [];
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
  const [transactionOverrides, setTransactionOverrides] = useState<
    TransactionOverrides[]
  >(
    solanaTxsData.map((solanaTxData) => ({
      priorityFee:
        solanaTxData?.solanaFeeConfig?.config?.priorityFee?.toString() ?? "0",
      computeUnits:
        solanaTxData?.solanaFeeConfig?.config?.computeUnits?.toString() ?? "0",
      disableFeeConfig: !user.preferences.developerMode,
    }))
  );

  const onApprove = () =>
    currentRequest.respond({
      transactionOverrides,
      confirmed: true,
    });

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
        onIgnore={null}
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
      ) : blowfishError ||
        blowfishEvaluation.error ||
        !blowfishEvaluation.normalizedEvaluation ? (
        <LegacyAllTransactionDetails
          currentRequest={currentRequest}
          onApprove={onApprove}
          onDeny={onDeny}
          solanaTxsData={solanaTxsData}
          transactionOverrides={transactionOverrides}
          setTransactionOverrides={setTransactionOverrides}
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

function LegacyAllTransactionDetails({
  currentRequest,
  onApprove,
  onDeny,
  solanaTxsData,
  transactionOverrides,
  setTransactionOverrides,
}: {
  currentRequest: QueuedUiRequest<"SECURE_SVM_SIGN_ALL_TX">;
  onApprove: () => void;
  onDeny: () => void;
  solanaTxsData: TransactionDataType[];
  transactionOverrides: TransactionOverrides[];
  setTransactionOverrides: (old: TransactionOverrides[]) => void;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const aggregatedTx = aggregateTxData(solanaTxsData);

  const setSingleTransactionOverrides =
    (index: number) =>
    (
      newOverride:
        | TransactionOverrides
        | ((old: TransactionOverrides) => TransactionOverrides)
    ) => {
      const newOverrides = [...transactionOverrides];
      newOverrides[index] =
        typeof newOverride === "function"
          ? newOverride(newOverrides[index])
          : newOverride;
      setTransactionOverrides(newOverrides);
    };

  return (
    <RequestConfirmation
      title={`Sign ${solanaTxsData.length} Transactions`}
      onApprove={onApprove}
      onDeny={onDeny}
    >
      {["browser", "xnft"].includes(currentRequest.event.origin.context) ? (
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
      <Stack space="$3">
        <SolanaTransactionDetails
          setTransactionOverrides={() => {}}
          transactionOverrides={{
            disableFeeConfig: true,
            computeUnits: "0",
            priorityFee: "0",
          }}
          solanaTxData={aggregatedTx}
          title={`Aggregated [${solanaTxsData.length}] Transaction Details:`}
        />
        <StyledText
          fontSize="$sm"
          textAlign="center"
          color="$baseTextMedEmphasis"
          cursor="pointer"
          onPress={() => setShowAdvanced(!showAdvanced)}
        >
          {!showAdvanced ? "Show Advanced Details" : "Hide Advanced Details"}
        </StyledText>
      </Stack>
      {showAdvanced
        ? solanaTxsData.map((solanaTxData, i) => (
            <SolanaTransactionDetails
              key={i}
              setTransactionOverrides={setSingleTransactionOverrides(i)}
              transactionOverrides={transactionOverrides[i]}
              solanaTxData={solanaTxData}
              title={`[${i + 1}/${solanaTxsData.length}] Transaction Details:`}
            />
          ))
        : null}
    </RequestConfirmation>
  );
}

function aggregateTxData(solanaTxsData: TransactionDataType[]) {
  const allBalanceChanges: TransactionDataType["balanceChanges"] = {};
  let allNetworkFees = "0";

  for (const tx of solanaTxsData) {
    if (tx.balanceChanges) {
      Object.entries(tx.balanceChanges).forEach(([key, val]) => {
        allBalanceChanges[key] = {
          nativeChange: (
            allBalanceChanges[key]?.nativeChange ?? BigNumber.from("0")
          ).add(val.nativeChange),
          decimals: val.decimals,
        };
      });
    }

    allNetworkFees = (
      parseFloat(allNetworkFees) + parseFloat(tx.networkFee)
    ).toPrecision(2);
  }
  return {
    ...solanaTxsData[0],
    balanceChanges: allBalanceChanges,
    networkFee: allNetworkFees,
  };
}
