import type { QueuedUiRequest } from "../../_atoms/requestAtoms";
import type { TransactionOverrides } from "../../_sharedComponents/SolanaTransactionDetails";
import type { TypedObject } from "@coral-xyz/secure-background/types";

import { useEffect, useState } from "react";

import { formatWalletAddress } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import {
  secureUserAtom,
  solanaTokenMetadata,
  useAvatarUrl,
  useSolanaTxData,
} from "@coral-xyz/recoil";
import { ProxyImage, Stack, StyledText, XStack } from "@coral-xyz/tamagui";
import { formatUnits } from "ethers6";
import { useRecoilValue } from "recoil";

import { RequireUserUnlocked } from "../../RequireUserUnlocked/RequireUserUnlocked";
import { ErrorMessage } from "../../_sharedComponents/ErrorMessage";
import { FungibleHeader } from "../../_sharedComponents/FungibleHeader";
import { Loading } from "../../_sharedComponents/Loading";
import { NftHeader } from "../../_sharedComponents/NftHeader";
import { RenderWallet } from "../../_sharedComponents/RenderWallet";
import { RequestConfirmation } from "../../_sharedComponents/RequestConfirmation";
import { TransactionTable } from "../../_sharedComponents/TransactionTable";

type Request = QueuedUiRequest<"SECURE_SVM_SIGN_TX">;

export function SwapTokenTransaction({
  currentRequest,
  uiOptions,
}: {
  currentRequest: Request;
  uiOptions: TypedObject<Request["uiOptions"], "SWAP_TOKENS">;
}) {
  const user = useRecoilValue(secureUserAtom);
  const solanaTxData = useSolanaTxData(currentRequest.request.tx);
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const { t } = useTranslation();

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

  const onRefresh = () => currentRequest.error(new Error("Quote Expired"));

  const toTokenMetadata = useRecoilValue(
    solanaTokenMetadata({ mintAddress: uiOptions.toToken })
  );

  const fromTokenMetadata = useRecoilValue(
    solanaTokenMetadata({ mintAddress: uiOptions.fromToken })
  );

  // quotes expire and require a refresh after some time
  useEffect(() => {
    if (needsRefresh) {
      setNeedsRefresh(false);
    }
    const timeout = setTimeout(() => {
      setNeedsRefresh(true);
    }, uiOptions.expirationTimeMs);
    return () => clearTimeout(timeout);
  }, [currentRequest.id]);

  if (!toTokenMetadata || !fromTokenMetadata) {
    return <Loading />;
  }

  const fromSymbol =
    fromTokenMetadata.symbol === "wSOL" ? "SOL" : fromTokenMetadata.symbol;
  const toSymbol =
    toTokenMetadata.symbol === "wSOL" ? "SOL" : toTokenMetadata.symbol;

  return (
    <RequireUserUnlocked
      onReset={() => currentRequest.error(new Error("Login Failed"))}
    >
      <RequestConfirmation
        title={t("swap_symbol", { symbol: fromSymbol })}
        onApprove={needsRefresh ? onRefresh : onApprove}
        rightButton={needsRefresh ? t("refresh_quote") : t("approve")}
        onDeny={onDeny}
      >
        <Stack justifyContent="center" alignItems="center">
          <StyledText
            color="$baseTextMedEmphasis"
            fontSize="$sm"
            marginBottom="$-3"
          >
            {t("you_receive")}
          </StyledText>
          <FungibleHeader
            currency={toSymbol}
            amount={formatUnits(uiOptions.toAmount, toTokenMetadata.decimals)}
            logo={toTokenMetadata.image}
          />
        </Stack>
        <TransactionTable
          items={[
            {
              label: t("you_pay"),
              value: formatUnits(
                uiOptions.fromAmount,
                fromTokenMetadata.decimals
              ),
              valueAfter: (
                <StyledText fontSize="$sm" color="$baseTextMedEmphasis">
                  {fromSymbol}
                </StyledText>
              ),
            },
            {
              label: t("rate"),
              value: `1 ${fromSymbol} ≈ ${uiOptions.rate} ${toSymbol}`,
            },
            {
              label: t("price_impact"),
              value: uiOptions.priceImpact,
              valueAfter: (
                <StyledText fontSize="$sm" color="$baseTextMedEmphasis">
                  %
                </StyledText>
              ),
            },
            {
              label: t("estimated_fees"),
              value: uiOptions.transactionFees
                ? `~ ${formatUnits(uiOptions.transactionFees.total, 9)}`
                : "-",
              valueAfter: (
                <StyledText fontSize="$sm" color="$baseTextMedEmphasis">
                  SOL
                </StyledText>
              ),
              toolTip: uiOptions.transactionFees ? (
                <Stack paddingHorizontal="$1" space="$1">
                  {/* <Stack space="$1"> */}
                  {Object.entries(uiOptions.transactionFees.fees ?? {}).map(
                    ([description, value]) => (
                      <XStack
                        key={description}
                        space="$2"
                        justifyContent="space-between"
                      >
                        <StyledText fontSize="$xs">{description}</StyledText>
                        <StyledText fontSize="$xs" textAlign="right">
                          {formatUnits(value, 9)} SOL
                        </StyledText>
                      </XStack>
                    )
                  )}
                  {/* </Stack> */}
                  {uiOptions.backpackFeePercent > 0 ? (
                    <StyledText fontSize="$xs" color="$baseTextMedEmphasis">
                      {t("swap_fees_warning", {
                        pct: uiOptions.backpackFeePercent,
                      })}
                    </StyledText>
                  ) : null}
                </Stack>
              ) : undefined,
            },
          ]}
        />
      </RequestConfirmation>
    </RequireUserUnlocked>
  );
}
