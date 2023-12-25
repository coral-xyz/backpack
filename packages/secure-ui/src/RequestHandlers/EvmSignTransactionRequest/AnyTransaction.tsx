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
import { BlowfishTransactionDetails } from "../../_sharedComponents/BlowfishEvaluation";
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

  const publicKeyInfo =
    user.publicKeys.platforms[Blockchain.ETHEREUM]?.publicKeys[
      currentRequest.request.publicKey
    ];

  return (
    <RequireUserUnlocked
      onReset={() => currentRequest.error(new Error("Login Failed"))}
    >
      {blowfishEvaluation.isLoading ? (
        <Loading />
      ) : blowfishError ||
        blowfishEvaluation.error ||
        !blowfishEvaluation.normalizedEvaluation ? (
        <FallbackTransactionInfo
          currentRequest={currentRequest}
          onApprove={onApprove}
          onDeny={onDeny}
          networkFees={networkFees}
          publicKeyInfo={publicKeyInfo}
          transaction={transaction}
          speed={speed}
          setSpeed={setSpeed}
          settingsOpen={settingsOpen}
          setSettingsOpen={setSettingsOpen}
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

function FallbackTransactionInfo({
  currentRequest,
  onApprove,
  onDeny,
  networkFees,
  publicKeyInfo,
  transaction,
  setSettingsOpen,
  speed,
}: {
  currentRequest: Request;
  onApprove: () => void;
  onDeny: () => void;
  networkFees: bigint;
  publicKeyInfo?: UserPublicKeyInfo;
  transaction: Transaction;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  speed: Speed;
  setSpeed: (open: Speed) => void;
  transactionOverrides: TransactionOverrides;
  setTransactionOverrides: (open: TransactionOverrides) => void;
}) {
  const user = useRecoilValue(secureUserAtom);

  return (
    <RequestConfirmation
      title="Sign Transaction"
      onDeny={onDeny}
      onApprove={onApprove}
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
        blockchain={Blockchain.ETHEREUM}
      />
      <Stack space="$2">
        <TransactionTable
          items={[
            {
              label: "From",
              value: (
                <RenderWallet
                  username={user.user.username}
                  walletName={publicKeyInfo?.name}
                  publicKey={currentRequest.request.publicKey}
                />
              ),
            },
            transaction.to
              ? {
                  label: "To",
                  value: <RenderWallet publicKey={transaction.to} />,
                }
              : null,

            transaction.gasLimit
              ? {
                  label: "Gas Fees",
                  value: `${formatUnits(networkFees, 18)}`,
                  valueAfter: "ETH",
                }
              : null,
            {
              label: "Speed",
              value: (
                <StyledText
                  borderRadius="$9"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="$sm"
                  // TODO display:flex
                  // eslint-disable-next-line
                  display="flex"
                  space="$1"
                  paddingHorizontal="$3"
                  paddingVertical="$1"
                  backgroundColor="$baseBackgroundL1"
                >
                  {speed} <ChevronDownIcon size="$sm" />
                </StyledText>
              ),
              onPress: () => {
                setSettingsOpen(true);
              },
            },
          ]}
        />
        {!transaction.gasLimit ? (
          <StyledText fontSize="$sm" color="$redText">
            This transaction is unlikely to succeed.
          </StyledText>
        ) : null}
      </Stack>
    </RequestConfirmation>
  );
}
