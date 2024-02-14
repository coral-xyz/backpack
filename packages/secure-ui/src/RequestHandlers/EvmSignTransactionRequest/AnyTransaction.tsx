import type {
  Speed,
  TransactionOverrides,
} from "./_sharedComponents/TransactionSettingsDrawer";
import type { QueuedUiRequest } from "../../_atoms/requestAtoms";
import type {
  TypedObject,
  UserPublicKeyInfo,
} from "@coral-xyz/secure-background/types";

import { useEffect, useState } from "react";

import { Blockchain, formatWalletAddress } from "@coral-xyz/common";
import { ethereumClientAtom, secureUserAtom } from "@coral-xyz/recoil";
import { EthereumClient } from "@coral-xyz/secure-clients";
import {
  Button,
  ChevronDownIcon,
  CustomScrollView,
  Input,
  PrimaryButton,
  ProxyImage,
  SecondaryButton,
  Stack,
  StyledText,
  TextArea,
  TwoButtonFooter,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";
import { decode } from "bs58";
import { formatEther, formatUnits, parseUnits, Transaction } from "ethers6";
import { useRecoilValue } from "recoil";

import {
  getOverrides,
  TransactionSettingsDrawer,
} from "./_sharedComponents/TransactionSettingsDrawer";
import { useFetchEthereumBlowfishEvaluation } from "./useFetchEthereumBlowfishEvaluation";
import { RequireUserUnlocked } from "../../RequireUserUnlocked/RequireUserUnlocked";
import {
  BlockingWarning,
  BlowfishTransactionDetails,
} from "../../_sharedComponents/BlowfishEvaluation";
import { Loading } from "../../_sharedComponents/Loading";
import { OriginUserHeader } from "../../_sharedComponents/OriginHeader";
import { RenderWallet } from "../../_sharedComponents/RenderWallet";
import { RequestConfirmation } from "../../_sharedComponents/RequestConfirmation";
import { TransactionTable } from "../../_sharedComponents/TransactionTable";
import { Warning } from "../../_sharedComponents/Warning";

type Request = QueuedUiRequest<"SECURE_EVM_SIGN_TX">;

export function AnyTransaction({
  currentRequest,
}: {
  currentRequest: Request;
  uiOptions: TypedObject<Request["uiOptions"], "ANY">;
}) {
  const user = useRecoilValue(secureUserAtom);
  const transaction = Transaction.from(currentRequest.request.txHex);
  const [blowfishError, setBlowfishError] = useState(false);

  const blowfishEvaluation = useFetchEthereumBlowfishEvaluation(
    EthereumClient.config.blowfishUrl,
    [transaction],
    currentRequest.event.origin.address,
    currentRequest.request.publicKey,
    (error) => {
      setBlowfishError(true);
      console.error(error);
    }
  );

  const [transactionOverrides, setTransactionOverrides] =
    useState<TransactionOverrides>(getOverrides(transaction, 100));
  const [speed, setSpeed] = useState<Speed>("Normal");
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [showSimulationFailed, setShowSimulationFailed] = useState(true);

  const networkFees =
    BigInt(transaction.gasLimit ?? 0) *
      BigInt(transactionOverrides.maxFeePerGas) +
    BigInt(transaction.gasLimit ?? 0) *
      BigInt(transactionOverrides.maxPriorityFeePerGas);

  const onApprove = () =>
    currentRequest.respond({
      ...transactionOverrides,
      confirmed: true,
    });

  const onDeny = () => currentRequest.error(new Error("Approval Denied"));

  return (
    <RequireUserUnlocked
      onReset={() => currentRequest.error(new Error("Login Failed"))}
    >
      {blowfishEvaluation.isLoading ? (
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
          prepend={[
            <YStack key="Speed" space="$4">
              <StyledText fontWeight="$bold" color="$baseTextMedEmphasis">
                Transaction Details
              </StyledText>
              <XStack
                alignItems="center"
                justifyContent="space-between"
                space="$3"
              >
                <YStack space="$1">
                  <StyledText fontWeight="$bold" fontSize="$sm">
                    Speed
                  </StyledText>
                </YStack>
                <XStack
                  borderRadius="$4"
                  space="$2"
                  alignItems="center"
                  justifyContent="center"
                  paddingLeft="$3"
                  paddingRight="$2"
                  paddingVertical="$2"
                  backgroundColor="$baseBackgroundL1"
                  onPress={() => {
                    setSettingsOpen(true);
                  }}
                  hoverStyle={{
                    cursor: "pointer",
                  }}
                >
                  <StyledText fontSize="$sm">{speed}</StyledText>
                  <ChevronDownIcon size="$sm" />
                </XStack>
              </XStack>
              <XStack
                alignItems="center"
                justifyContent="space-between"
                space="$3"
              >
                <YStack space="$1">
                  <StyledText fontWeight="$bold" fontSize="$sm">
                    Gas Fees
                  </StyledText>
                </YStack>
                <StyledText fontSize="$sm">
                  {`${formatUnits(networkFees, 18)} ETH`}
                </StyledText>
              </XStack>
            </YStack>,
          ]}
        />
      )}
      <TransactionSettingsDrawer
        isOpen={settingsOpen}
        setIsOpen={setSettingsOpen}
        isAdvancedMode={!!user.preferences.developerMode}
        transaction={transaction}
        speed={speed}
        setSpeed={setSpeed}
        transactionOverrides={transactionOverrides}
        setTransactionOverrides={setTransactionOverrides}
      />
    </RequireUserUnlocked>
  );
}
