import type { Speed } from "./_sharedComponents/TransactionSettingsDrawer";
import type { QueuedUiRequest } from "../../_atoms/requestAtoms";
import type { TypedObject } from "@coral-xyz/secure-background/types";

import { useState } from "react";

import { Blockchain, formatWalletAddress } from "@coral-xyz/common";
import { secureUserAtom } from "@coral-xyz/recoil";
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
import { RequireUserUnlocked } from "../../RequireUserUnlocked/RequireUserUnlocked";
import { FungibleHeader } from "../../_sharedComponents/FungibleHeader";
import { NftHeader } from "../../_sharedComponents/NftHeader";
import { RenderWallet } from "../../_sharedComponents/RenderWallet";
import { RequestConfirmation } from "../../_sharedComponents/RequestConfirmation";
import { TransactionTable } from "../../_sharedComponents/TransactionTable";

type Request = QueuedUiRequest<"SECURE_EVM_SIGN_TX">;
type TransactionOverrides = {
  gasLimit: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  nonce: number;
};

export function SendTokenTransaction({
  currentRequest,
  uiOptions,
}: {
  currentRequest: Request;
  uiOptions: TypedObject<Request["uiOptions"], "SEND_TOKEN" | "SEND_NFT">;
}) {
  const user = useRecoilValue(secureUserAtom);
  const transaction = Transaction.from(currentRequest.request.txHex);

  const [transactionOverrides, setTransactionOverrides] =
    useState<TransactionOverrides>(getOverrides(transaction, 100));
  const [speed, setSpeed] = useState<Speed>("Normal");
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  const onApprove = () =>
    currentRequest.respond({
      ...transactionOverrides,
      confirmed: true,
    });

  const onDeny = () => currentRequest.error(new Error("Approval Denied"));

  const networkFees =
    BigInt(transaction.gasLimit ?? 0) *
      BigInt(transactionOverrides.maxFeePerGas) +
    BigInt(transaction.gasLimit ?? 0) *
      BigInt(transactionOverrides.maxPriorityFeePerGas);

  const senderPublicKeyInfo =
    user.publicKeys.platforms[Blockchain.ETHEREUM]?.publicKeys[
      currentRequest.request.publicKey
    ];
  const receiverPublicKeyInfo =
    user.publicKeys.platforms[Blockchain.ETHEREUM]?.publicKeys[
      uiOptions.to.address
    ];

  const wallet =
    receiverPublicKeyInfo?.name ??
    (uiOptions.to.username ? `@${uiOptions.to.username}` : "wallet");

  return (
    <RequireUserUnlocked
      onReset={() => currentRequest.error(new Error("Login Failed"))}
    >
      <RequestConfirmation
        title={`Send to ${wallet}`}
        onDeny={onDeny}
        onApprove={onApprove}
      >
        {uiOptions.type === "SEND_NFT" ? (
          <NftHeader
            assetId={uiOptions.assetId}
            name={uiOptions.token.name ?? ""}
            image={uiOptions.token.logo}
          />
        ) : (
          <FungibleHeader
            currency={uiOptions.token.ticker ?? ""}
            amount={formatUnits(uiOptions.amount, uiOptions.token.decimals)}
            logo={uiOptions.token.logo}
          />
        )}
        <Stack space="$2">
          <TransactionTable
            items={[
              {
                label: "From",
                value: (
                  <RenderWallet
                    username={user.user.username}
                    walletName={senderPublicKeyInfo?.name}
                    publicKey={currentRequest.request.publicKey}
                  />
                ),
              },
              transaction.to
                ? {
                    label: "To",
                    value: (
                      <RenderWallet
                        publicKey={transaction.to}
                        walletName={receiverPublicKeyInfo?.name}
                        username={uiOptions.to.username}
                      />
                    ),
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
        </Stack>
      </RequestConfirmation>
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
