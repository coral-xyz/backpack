import type { QueuedUiRequest } from "../../_atoms/requestAtoms";
import type { TransactionOverrides } from "../../_sharedComponents/SolanaTransactionDetails";
import type { TransactionData } from "@coral-xyz/recoil";
import type { TypedObject } from "@coral-xyz/secure-background/types";

import { useState } from "react";

import { Blockchain, formatWalletAddress } from "@coral-xyz/common";
import {
  secureUserAtom,
  solanaTokenMetadata,
  useAvatarUrl,
  useSolanaTxData,
} from "@coral-xyz/recoil";
import {
  DangerButton,
  ProxyImage,
  Stack,
  StyledText,
  XStack,
} from "@coral-xyz/tamagui";
import { formatUnits } from "ethers6";
import { useRecoilValue } from "recoil";

import { RequireUserUnlocked } from "../../RequireUserUnlocked/RequireUserUnlocked";
import { Loading } from "../../_sharedComponents/Loading";
import { NftHeader } from "../../_sharedComponents/NftHeader";
import { OriginUserHeader } from "../../_sharedComponents/OriginHeader";
import { RenderWallet } from "../../_sharedComponents/RenderWallet";
import { RequestConfirmation } from "../../_sharedComponents/RequestConfirmation";
import { TransactionTable } from "../../_sharedComponents/TransactionTable";
import { createBalanceChangeItems } from "../../_utils/createBalanceChangeItems";

type Request = QueuedUiRequest<"SECURE_SVM_SIGN_TX">;

export function UninstallXnftTransaction({
  currentRequest,
  uiOptions,
}: {
  currentRequest: Request;
  uiOptions: TypedObject<Request["uiOptions"], "UNINSTALL_XNFT">;
}) {
  const user = useRecoilValue(secureUserAtom);
  const solanaTxData = useSolanaTxData(currentRequest.request.tx);

  const [transactionOverrides, setTransactionOverrides] =
    useState<TransactionOverrides>({
      priorityFee:
        solanaTxData?.solanaFeeConfig?.config?.priorityFee?.toString() ?? "0",
      computeUnits:
        solanaTxData?.solanaFeeConfig?.config?.computeUnits?.toString() ?? "0",
      disableFeeConfig: !user.preferences.developerMode,
    });

  const onApprove = () =>
    currentRequest.respond({
      transactionOverrides,
      confirmed: true,
    });

  const onDeny = () => currentRequest.error(new Error("Approval Denied"));

  const tokenMetadata = useRecoilValue(
    solanaTokenMetadata({ mintAddress: uiOptions.tokenMint })
  );
  const senderPublicKeyInfo =
    user.publicKeys.platforms[Blockchain.SOLANA]?.publicKeys[
      currentRequest.request.publicKey
    ];

  if (!tokenMetadata) {
    return <Loading />;
  }

  return (
    <RequireUserUnlocked
      onReset={() => currentRequest.error(new Error("Login Failed"))}
    >
      <RequestConfirmation
        title="Uninstall xNft"
        rightButton={<DangerButton label="Uninstall" />}
        onApprove={onApprove}
        onDeny={onDeny}
      >
        <Stack justifyContent="center" alignItems="center">
          <NftHeader
            assetId={uiOptions.assetId}
            name={tokenMetadata.name}
            image={uiOptions.iconUrl}
          />
        </Stack>
        <StyledText color="$baseTextMedEmphasis" textAlign="center">
          Are you sure you want to uninstall this xNFT?
        </StyledText>
        <TransactionTable
          items={[
            {
              label: "From",
              value: (
                <RenderWallet
                  publicKey={currentRequest.request.publicKey}
                  username={user.user.username}
                  walletName={senderPublicKeyInfo?.name}
                />
              ),
            },
            ...createBalanceChangeItems(solanaTxData),
            {
              label: "Network Fee",
              value: solanaTxData.networkFee,
              valueAfter: (
                <StyledText fontSize="$sm" color="$baseTextMedEmphasis">
                  SOL
                </StyledText>
              ),
            },
          ]}
        />
      </RequestConfirmation>
    </RequireUserUnlocked>
  );
}
