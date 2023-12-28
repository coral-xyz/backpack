import type { ViewStyle } from "react-native";
import {
  formatDate,
  formatSnakeToTitleCase,
  formatWalletAddress,
} from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import {
  useActiveWallet,
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
} from "@coral-xyz/recoil";
import { explorerUrl } from "@coral-xyz/secure-background/legacyCommon";
import {
  ArrowUpRightIcon,
  openUrl,
  StyledText,
  TableCore,
  TableRowCore,
  XStack,
} from "@coral-xyz/tamagui";

import type { ParseTransactionDetails } from "../parsing";
import type { ResponseTransaction } from "../utils";

export type TransactionDetailsTableProps = {
  details: ParseTransactionDetails;
  style?: ViewStyle;
  transaction: ResponseTransaction;
};

export function TransactionDetailsTable({
  details,
  style,
  transaction,
}: TransactionDetailsTableProps) {
  const { t } = useTranslation();
  const active = useActiveWallet();
  const connection = useBlockchainConnectionUrl(active.blockchain);
  const explorer = useBlockchainExplorer(active.blockchain);

  return (
    <TableCore style={{ width: "100%", ...style }}>
      {transaction.timestamp ? (
        <TableRowCore
          label={t("activity_table_labels.date")}
          value={formatDate(new Date(transaction.timestamp), true)}
        />
      ) : null}
      {details.details.item ? (
        <TableRowCore label={t("item")} value={details.details.item} />
      ) : null}
      {details.details.amount ? (
        <TableRowCore
          label={t("activity_table_labels.amount")}
          value={<_TransactionAmountRowValue amount={details.details.amount} />}
        />
      ) : null}
      {details.details.transferInfo ? (
        <TableRowCore
          label={details.details.transferInfo.directionLabel}
          value={formatWalletAddress(details.details.transferInfo.otherWallet)}
        />
      ) : null}
      <TableRowCore
        label={t("activity_table_labels.source")}
        value={formatSnakeToTitleCase(transaction.source ?? t("unknown"))}
      />
      {transaction.fee ? (
        <TableRowCore label={t("network_fee")} value={transaction.fee} />
      ) : null}
      {transaction.feePayer && transaction.feePayer !== active.publicKey ? (
        <TableRowCore
          label={t("network_fee_payer")}
          value={formatWalletAddress(transaction.feePayer!)}
        />
      ) : null}
      <TableRowCore
        label={t("activity_table_labels.status")}
        value={<_TransactionStatusRowValue error={!!transaction.error} />}
      />
      <TableRowCore
        label={t("activity_table_labels.signature")}
        value={<_TransactionSignatureRowValue hash={transaction.hash} />}
        onPress={() =>
          openUrl(explorerUrl(explorer, transaction.hash, connection))
        }
      />
    </TableCore>
  );
}

function _TransactionAmountRowValue({ amount }: { amount: string }) {
  const color = amount.startsWith("-")
    ? "$redText"
    : amount.startsWith("+")
    ? "$greenText"
    : "$baseTextHighEmphasis";
  return (
    <StyledText color={color} fontSize="$sm">
      {amount}
    </StyledText>
  );
}

function _TransactionSignatureRowValue({ hash }: { hash: string }) {
  return (
    <XStack alignItems="center" gap={4}>
      <StyledText color="$accentBlue" fontSize="$sm">
        {_truncateSignature(hash)}
      </StyledText>
      <ArrowUpRightIcon color="$accentBlue" size={14} />
    </XStack>
  );
}

function _TransactionStatusRowValue({ error }: { error: boolean }) {
  const { t } = useTranslation();
  return error ? (
    <StyledText color="$redText" fontSize="$sm">
      {t("failed")}
    </StyledText>
  ) : (
    <StyledText color="$greenText" fontSize="$sm">
      {t("confirmed")}
    </StyledText>
  );
}

/**
 * Truncate the signature hash for display.
 * @param {string} sig
 * @returns {string}
 */
function _truncateSignature(sig: string): string {
  return `${sig.slice(0, 4)}...${sig.slice(sig.length - 5)}`;
}
