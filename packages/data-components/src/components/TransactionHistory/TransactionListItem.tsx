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
  TamaguiIcons,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";

import type { ChainId, Transaction } from "../../apollo/graphql";

import {
  parseTransactionDescription,
  type ParseTransactionDetails,
} from "./parsing";
import { TransactionListItemIconDefault } from "./TransactionListItemIcon";

export type TransactionListItemProps = {
  blockchain: ChainId;
  onClick?: (transaction: Partial<Transaction>, explorerUrl: string) => void;
  transaction: Partial<Transaction>;
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
   * Memoized click handler to pass in the transaction object explorer URL
   * to the remote prop function declaration.
   */
  const handleClick = useCallback(
    () =>
      onClick
        ? onClick(
            transaction,
            explorerUrl(explorer, transaction.hash ?? "", connection)
          )
        : {},
    [connection, explorer, onClick, transaction]
  );

  /**
   * The parsed transaction type and description to provide the list item
   * display details and the list item icon component.
   */
  const details = parseTransactionDescription(
    wallet.publicKey,
    transaction.description ?? "",
    transaction.type ?? ""
  );

  return (
    <ListItemCore
      style={{ backgroundColor: "$nav", cursor: "pointer", hoverTheme: true }}
      icon={details?.icon ?? <TransactionListItemIconDefault size={44} />}
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
  const brColor = details?.br?.startsWith("+")
    ? "$positive"
    : details?.br?.startsWith("-")
    ? "$negative"
    : "$secondary";

  const trColor = details?.tr.startsWith("+")
    ? "$positive"
    : details?.tr.startsWith("-")
    ? "$negative"
    : undefined;

  return details ? (
    <YStack display="flex" flex={1}>
      <XStack
        display="flex"
        flex={1}
        alignItems="center"
        justifyContent="space-between"
      >
        <StyledText>{details.tl}</StyledText>
        <StyledText fontSize="$sm" color={trColor}>
          {details.tr}
        </StyledText>
      </XStack>
      {details.bl || details.br ? (
        <XStack
          display="flex"
          flex={1}
          alignItems="center"
          justifyContent="space-between"
        >
          <StyledText color="$secondary" fontSize="$xs">
            {details.bl ?? ""}
          </StyledText>
          <StyledText color={brColor} fontSize="$xs">
            {details.br ?? ""}
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
