import { useCallback } from "react";
import { type Blockchain } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import {
  getBlockchainLogo,
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
} from "@coral-xyz/recoil";
import { explorerUrl } from "@coral-xyz/secure-background/legacyCommon";
import {
  ArrowUpRightIcon,
  Image,
  ListItemCore,
  StyledText,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";

import type { ProviderId } from "../../apollo/graphql";

import { useTransactionsContext } from "./context";
import { parseTransaction, type ParseTransactionDetails } from "./parsing";
import {
  TransactionListItemIconDefault,
  TransactionListItemIconError,
} from "./TransactionListItemIcon";
import type { ResponseTransaction } from "./utils";

export type TransactionListItemProps = {
  blockchain: ProviderId;
  transaction: ResponseTransaction;
};

export function TransactionListItem({
  blockchain,
  transaction,
}: TransactionListItemProps) {
  const { t } = useTranslation();
  const { onItemClick } = useTransactionsContext();
  const connection = useBlockchainConnectionUrl(
    blockchain.toLowerCase() as Blockchain
  );

  const explorer = useBlockchainExplorer(
    blockchain.toLowerCase() as Blockchain
  );

  /**
   * The parsed transaction type and description to provide the list item
   * display details and the list item icon component.
   */
  const details = parseTransaction(transaction, t);

  /**
   * Memoized click handler to pass in the transaction object explorer URL
   * to the remote prop function declaration.
   */
  const handleClick = useCallback(
    () =>
      onItemClick
        ? onItemClick(
            transaction,
            explorerUrl(explorer, transaction.hash ?? "", connection),
            details
          )
        : {},
    [connection, details, explorer, onItemClick, transaction]
  );

  const icon = transaction.error ? (
    <TransactionListItemIconError size={30} containerSize={44} />
  ) : (
    details?.card.icon ?? (
      <TransactionListItemIconDefault size={30} containerSize={44} />
    )
  );

  return (
    <ListItemCore
      style={{
        overflow: "hidden",
        cursor: "pointer",
        hoverTheme: true,
      }}
      icon={icon}
      onClick={handleClick}
    >
      <_TransactionListItemEnriched
        blockchain={blockchain}
        details={details}
        transaction={transaction}
      />
    </ListItemCore>
  );
}

function _TransactionListItemEnriched({
  blockchain,
  details,
  transaction,
}: Omit<TransactionListItemProps, "onClick"> & {
  details?: ParseTransactionDetails | null;
}) {
  const brColor = details?.card.br?.startsWith("+")
    ? "$greenText"
    : details?.card.br?.startsWith("-")
    ? "$redText"
    : "$baseTextMedEmphasis";

  const trColor = details?.card.tr.startsWith("+")
    ? "$greenText"
    : details?.card.tr.startsWith("-")
    ? "$redText"
    : undefined;

  return details ? (
    <YStack display="flex" flex={1}>
      <XStack display="flex" flex={1} justifyContent="space-between">
        <StyledText>{details.card.tl}</StyledText>
        <StyledText flex={0} fontSize="$sm" color={trColor} textAlign="right">
          {details.card.tr}
        </StyledText>
      </XStack>
      {details.card.bl || details.card.br ? (
        <XStack
          display="flex"
          flex={1}
          alignItems="center"
          justifyContent="space-between"
        >
          <StyledText color="$baseTextMedEmphasis" fontSize="$xs">
            {details.card.bl ?? ""}
          </StyledText>
          <StyledText flex={0} color={brColor} fontSize="$xs">
            {details.card.br ?? ""}
          </StyledText>
        </XStack>
      ) : null}
    </YStack>
  ) : (
    <_TransactionListItemBasic
      blockchain={blockchain}
      transaction={transaction}
    />
  );
}

export function _TransactionListItemBasic({
  blockchain,
  transaction,
}: Omit<TransactionListItemProps, "onClick">) {
  const blockchainLogo = getBlockchainLogo(
    blockchain.toLowerCase() as Blockchain,
    true
  );

  return (
    <XStack flex={1} alignItems="center">
      <YStack flex={1} justifyContent="space-between">
        <XStack alignItems="center" space="$2">
          <Image
            height={12}
            width={12}
            marginTop="$-0.5"
            source={{ uri: blockchainLogo }}
          />
          <StyledText>{`${transaction.hash!.slice(
            0,
            4
          )}...${transaction.hash!.slice(
            transaction.hash!.length - 5
          )}`}</StyledText>
        </XStack>
        <StyledText color="$baseTextMedEmphasis" fontSize="$xs">
          {new Date(transaction.timestamp!).toLocaleString()}
        </StyledText>
      </YStack>
      <ArrowUpRightIcon color="$baseTextMedEmphasis" />
    </XStack>
  );
}
