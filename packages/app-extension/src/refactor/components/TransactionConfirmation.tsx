import { type ReactNode, useCallback } from "react";
import type { Blockchain } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { CrossIcon, Loading } from "@coral-xyz/react-common";
import {
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
} from "@coral-xyz/recoil";
import { explorerUrl } from "@coral-xyz/secure-background/legacyCommon";
import {
  ArrowUpRightIcon,
  BpPrimaryButton,
  CheckCircleIcon,
  StyledText,
  useTheme,
  XCircleIcon,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";

import { WithMiniDrawer } from "../../components/common/Layout/Drawer";

export function ConfirmationIcon({
  confirmed,
  hasError,
}: {
  confirmed: boolean;
  hasError: boolean;
}) {
  const theme = useTheme();
  if (confirmed) {
    return <CheckCircleIcon size={50} color={theme.greenIcon.val} />;
  } else if (hasError) {
    return <XCircleIcon size={50} color={theme.redIcon.val} />;
  }
  return <Loading />;
}

export function ConfirmationSubtitle({
  confirmed,
  content,
}: {
  confirmed: boolean;
  content: string;
}) {
  return (
    <XStack f={1} mt={12}>
      {!confirmed ? (
        <StyledText textAlign="center">{content}</StyledText>
      ) : null}
    </XStack>
  );
}

export function ConfirmationTokenAmountHeader({
  amount,
  icon,
  symbol,
}: {
  amount: string;
  icon?: ReactNode;
  symbol: string;
}) {
  return (
    <XStack ai="center" gap={8}>
      {icon}
      <StyledText fontSize="$3xl" fontWeight="$bold">
        {amount}
      </StyledText>
      <StyledText
        color="$baseTextMedEmphasis"
        fontSize="$3xl"
        fontWeight="$semiBold"
      >
        {symbol}
      </StyledText>
    </XStack>
  );
}

export function ConfirmationButtons({
  blockchain,
  confirmed,
  confirmedLabel,
  onConfirmedPress,
  signature,
}: {
  blockchain: Blockchain;
  confirmed: boolean;
  confirmedLabel: string;
  onConfirmedPress: () => void | Promise<void>;
  signature: string;
}) {
  const { t } = useTranslation();
  const connectionUrl = useBlockchainConnectionUrl(blockchain);
  const explorer = useBlockchainExplorer(blockchain);

  const openExplorerLink = useCallback(() => {
    const url = explorerUrl(explorer, signature, connectionUrl);
    window.open(url, "_blank");
  }, [connectionUrl, explorer, signature]);

  return (
    <YStack ai="center" gap={24} width="100%">
      {confirmed ? (
        <_ConfirmationViewTransaction onPress={openExplorerLink} />
      ) : null}
      <BpPrimaryButton
        label={confirmed ? confirmedLabel : t("view_explorer")}
        onPress={confirmed ? onConfirmedPress : openExplorerLink}
      />
    </YStack>
  );
}

export function ConfirmationErrorDrawer({
  error,
  open,
  resetError,
  setOpen,
}: {
  error?: string;
  open: boolean;
  resetError: () => void;
  setOpen: (val: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <WithMiniDrawer openDrawer={open} setOpenDrawer={setOpen}>
      <YStack ai="center" gap={16} minHeight={300} p={16}>
        <StyledText fontSize="$lg" fontWeight="$semiBold">
          {t("error")}
        </StyledText>
        <CrossIcon />
        <StyledText f={1} textAlign="center">
          {error}
        </StyledText>
        <BpPrimaryButton
          f={0}
          label={t("close")}
          onPress={() => {
            resetError();
            setOpen(false);
          }}
        />
      </YStack>
    </WithMiniDrawer>
  );
}

function _ConfirmationViewTransaction({
  onPress,
}: {
  onPress: () => void | Promise<void>;
}) {
  const { t } = useTranslation();
  return (
    <XStack
      ai="center"
      cursor="pointer"
      gap={2}
      onPress={onPress}
      pointerEvents="box-only"
    >
      <StyledText color="$accentBlue" fontWeight="$semiBold">
        {t("view_transaction")}
      </StyledText>
      <ArrowUpRightIcon color="$accentBlue" strokeWidth={3} size={18} />
    </XStack>
  );
}

export async function withTransactionCancelBypass(fn: Function) {
  try {
    await fn();
  } catch (err: any) {
    const msg = (err.message ?? "") as string;
    console.error("unable to create transaction", err);

    if (
      msg.toLowerCase().includes("approval denied") ||
      msg.toLowerCase().includes("closed")
    ) {
      // NOOP
    } else {
      throw err;
    }
  }
}
