import { Platform, type ViewStyle } from "react-native";
import {
  explorerUrl,
  formatDate,
  formatSnakeToTitleCase,
  formatWalletAddress,
} from "@coral-xyz/common";
import {
  useActiveWallet,
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
} from "@coral-xyz/recoil";
import {
  StyledText,
  TableCore,
  TableRowCore,
  XStack,
} from "@coral-xyz/tamagui";
import * as TamaguiIcons from "@tamagui/lucide-icons";
import * as Linking from "expo-linking";

import type { ResponseTransaction } from "..";
import type { ParseTransactionDetails } from "../parsing";

const openUrl = Platform.select({
  native: Linking.openURL,
  web: async (url: string): Promise<true> => {
    window.open(url);
    return true;
  },
})!;

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
  const active = useActiveWallet();
  const connection = useBlockchainConnectionUrl(active.blockchain);
  const explorer = useBlockchainExplorer(active.blockchain);

  return (
    <TableCore style={{ width: "100%", ...style }}>
      {transaction.timestamp ? (
        <TableRowCore
          label="Date"
          value={formatDate(new Date(transaction.timestamp), true)}
        />
      ) : null}
      {details.details.item ? (
        <TableRowCore label="Item" value={details.details.item} />
      ) : null}
      {/* <TableRowCore label="Type" value={snakeToTitleCase(transaction.type)} /> */}
      {details.details.amount ? (
        <TableRowCore
          label="Amount"
          value={<_TransactionAmountRowValue amount={details.details.amount} />}
        />
      ) : null}
      <TableRowCore
        label="Source"
        value={formatSnakeToTitleCase(transaction.source ?? "Unknown")}
      />
      {transaction.fee ? (
        <TableRowCore label="Network Fee" value={transaction.fee} />
      ) : null}
      {transaction.feePayer && transaction.feePayer !== active.publicKey ? (
        <TableRowCore
          label="Network Fee Payer"
          value={formatWalletAddress(transaction.feePayer!)}
        />
      ) : null}
      <TableRowCore
        label="Status"
        value={<_TransactionStatusRowValue error={!!transaction.error} />}
      />
      <TableRowCore
        label="Signature"
        value={<_TransactionSignatureRowValue hash={transaction.hash} />}
        onClick={() =>
          openUrl(explorerUrl(explorer, transaction.hash, connection))
        }
      />
    </TableCore>
  );
}

function _TransactionAmountRowValue({ amount }: { amount: string }) {
  const color = amount.startsWith("-")
    ? "$negative"
    : amount.startsWith("+")
    ? "$positive"
    : "$fontColor";
  return (
    <StyledText color={color} fontSize="$sm">
      {amount}
    </StyledText>
  );
}

function _TransactionSignatureRowValue({ hash }: { hash: string }) {
  return (
    <XStack alignItems="center" gap={4}>
      <StyledText color="$blue" fontSize="$sm">
        {_truncateSignature(hash)}
      </StyledText>
      <TamaguiIcons.ArrowUpRight color="$blue" size={14} />
    </XStack>
  );
}

function _TransactionStatusRowValue({ error }: { error: boolean }) {
  return error ? (
    <StyledText color="$negative" fontSize="$sm">
      Failed
    </StyledText>
  ) : (
    <StyledText color="$positive" fontSize="$sm">
      Confirmed
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
