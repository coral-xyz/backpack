import { Platform, type ViewStyle } from "react-native";
import { explorerUrl, walletAddressDisplay } from "@coral-xyz/common";
import {
  useActiveWallet,
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
} from "@coral-xyz/recoil";
import {
  StyledText,
  TableCore,
  TableRowCore,
  TamaguiIcons,
  XStack,
} from "@coral-xyz/tamagui";
import * as Linking from "expo-linking";

import { formatDate, snakeToTitleCase } from "../../utils";

import type { ResponseTransaction } from ".";

const openUrl = Platform.select({
  native: Linking.openURL,
  web: async (url: string): Promise<true> => {
    window.open(url);
    return true;
  },
})!;

export type TransactionDetailsTableProps = {
  style?: ViewStyle;
  transaction: ResponseTransaction;
};

export function TransactionDetailsTable({
  style,
  transaction,
}: TransactionDetailsTableProps) {
  const active = useActiveWallet();
  const connection = useBlockchainConnectionUrl(active.blockchain);
  const explorer = useBlockchainExplorer(active.blockchain);

  return (
    <TableCore style={style}>
      {transaction.timestamp ? <TableRowCore
        label="Date"
        value={formatDate(new Date(transaction.timestamp), true)}
        /> : null}
      <TableRowCore label="Type" value={snakeToTitleCase(transaction.type)} />
      <TableRowCore
        label="Source"
        value={snakeToTitleCase(transaction.source ?? "Unknown")}
      />
      {transaction.fee ? <TableRowCore label="Network Fee" value={transaction.fee} /> : null}
      {transaction.feePayer && transaction.feePayer !== active.publicKey ? <TableRowCore
        label="Network Fee Payer"
        value={walletAddressDisplay(transaction.feePayer!)}
        /> : null}
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
