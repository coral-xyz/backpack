import { useCallback } from "react";
import { type Blockchain, explorerUrl } from "@coral-xyz/common";
import {
  getBlockchainLogo,
  useActiveWallet,
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
} from "@coral-xyz/recoil";
import {
  ListItemCore,
  ListItemIconCore,
  StyledText,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";
import * as TamaguiIcons from "@tamagui/lucide-icons";

import type { ProviderId } from "../../apollo/graphql";

import type { ResponseTransaction } from ".";
import { parseTransaction, type ParseTransactionDetails } from "./parsing";
import {
  TransactionListItemIconDefault,
  TransactionListItemIconError,
} from "./TransactionListItemIcon";

export type TransactionListItemProps = {
  blockchain: ProviderId;
  onClick?: (
    transaction: ResponseTransaction,
    explorerUrl: string,
    parsedDetails: ParseTransactionDetails | null
  ) => void;
  transaction: ResponseTransaction;
};

export function TransactionListItem({
  blockchain,
  onClick,
  transaction,
}: TransactionListItemProps) {
  const wallet = useActiveWallet();
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
  const details = parseTransaction(wallet.publicKey, transaction);

  /**
   * Memoized click handler to pass in the transaction object explorer URL
   * to the remote prop function declaration.
   */
  const handleClick = useCallback(
    () =>
      onClick
        ? onClick(
            transaction,
            explorerUrl(explorer, transaction.hash ?? "", connection),
            details
          )
        : {},
    [connection, details, explorer, onClick, transaction]
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
      style={{ backgroundColor: "$nav", cursor: "pointer", hoverTheme: true }}
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
    ? "$positive"
    : details?.card.br?.startsWith("-")
    ? "$negative"
    : "$secondary";

  const trColor = details?.card.tr.startsWith("+")
    ? "$positive"
    : details?.card.tr.startsWith("-")
    ? "$negative"
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
          <StyledText color="$secondary" fontSize="$xs">
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

function _TransactionListItemBasic({
  blockchain,
  transaction,
}: Omit<TransactionListItemProps, "onClick">) {
  const blockchainLogo = getBlockchainLogo(
    blockchain.toLowerCase() as Blockchain
  );

  return (
    <XStack flex={1} alignItems="center">
      <YStack flex={1} justifyContent="space-between">
        <XStack alignItems="center">
          <ListItemIconCore
            style={{
              marginRight: 10,
            }}
            radius={2}
            size={12}
            image={blockchainLogo}
          />
          <StyledText>{transaction.hash!.slice(0, 4)}...</StyledText>
          <StyledText>
            {transaction.hash!.slice(transaction.hash!.length - 5)}
          </StyledText>
        </XStack>
        <StyledText color="$secondary" fontSize="$xs">
          {new Date(transaction.timestamp!).toLocaleString()}
        </StyledText>
      </YStack>
      <TamaguiIcons.ArrowUpRight color="$secondary" />
    </XStack>
  );
}
