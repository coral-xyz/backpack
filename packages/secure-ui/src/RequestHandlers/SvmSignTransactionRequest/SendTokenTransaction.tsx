import type { QueuedUiRequest } from "../../_atoms/requestAtoms";
import type { TransactionOverrides } from "../../_sharedComponents/SolanaTransactionDetails";
import type { TypedObject } from "@coral-xyz/secure-background/types";

import { useState } from "react";

import { Blockchain, formatWalletAddress } from "@coral-xyz/common";
import {
  secureUserAtom,
  solanaTokenMetadata,
  useAvatarUrl,
  useSolanaTxData,
} from "@coral-xyz/recoil";
import { ProxyImage, Stack, StyledText, XStack } from "@coral-xyz/tamagui";
import { formatUnits } from "ethers6";
import { RecoilValue, useRecoilValue } from "recoil";

import { FungibleHeader } from "../../_sharedComponents/FungibleHeader";
import { Loading } from "../../_sharedComponents/Loading";
import { NftHeader } from "../../_sharedComponents/NftHeader";
import { RenderWallet } from "../../_sharedComponents/RenderWallet";
import { RequestConfirmation } from "../../_sharedComponents/RequestConfirmation";
import { TransactionTable } from "../../_sharedComponents/TransactionTable";

type Request = QueuedUiRequest<"SECURE_SVM_SIGN_TX">;

export function SendTokenTransaction({
  currentRequest,
  uiOptions,
}: {
  currentRequest: Request;
  uiOptions: TypedObject<Request["uiOptions"], "SEND_TOKEN" | "SEND_NFT">;
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
  const receiverPublicKeyInfo =
    user.publicKeys.platforms[Blockchain.SOLANA]?.publicKeys[
      uiOptions.to.address
    ];

  if (!tokenMetadata) {
    return <Loading />;
  }

  const wallet =
    receiverPublicKeyInfo?.name ??
    (uiOptions.to.username ? `@${uiOptions.to.username}` : "wallet");

  return (
    <RequestConfirmation
      title={`Send to ${wallet}`}
      onApprove={onApprove}
      onDeny={onDeny}
    >
      <Stack justifyContent="center" alignItems="center">
        {uiOptions.type === "SEND_NFT" || tokenMetadata["properties"] ? (
          <NftHeader
            assetId={uiOptions.assetId}
            name={tokenMetadata.name}
            image={tokenMetadata.image}
          />
        ) : (
          <FungibleHeader
            currency={tokenMetadata.symbol}
            amount={uiOptions.amount}
            logo={tokenMetadata.image}
          />
        )}
      </Stack>
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
          {
            label: "To",
            value: (
              <RenderWallet
                publicKey={uiOptions.to.address}
                username={uiOptions.to.username}
                walletName={receiverPublicKeyInfo?.name}
              />
            ),
          },
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
  );
}
