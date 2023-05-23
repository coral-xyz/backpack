import { useCallback } from "react";
import type { Blockchain } from "@coral-xyz/common";
import { getBlockchainLogo } from "@coral-xyz/recoil";
import {
  ListItemCore,
  ListItemIconCore,
  StyledText,
  TamaguiIcons,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";

import type { ChainId, Transaction } from "../../apollo/graphql";

import { TransactionListItemIcon } from "./TransactionListItemIcon";
import { parseTransactionDescription } from "./utils";

export type TransactionListItemProps = {
  blockchain: ChainId;
  onClick?: (transaction: Partial<Transaction>) => void;
  transaction: Partial<Transaction>;
};

export function TransactionListItem({
  blockchain,
  onClick,
  transaction,
}: TransactionListItemProps) {
  const handleClick = useCallback(
    () => (onClick ? onClick(transaction) : {}),
    [onClick, transaction]
  );

  return (
    <ListItemCore
      style={{ backgroundColor: "$nav", cursor: "pointer" }}
      icon={<TransactionListItemIcon size={44} transaction={transaction} />}
      onClick={handleClick}
    >
      <_TransactionListItemEnriched
        blockchain={blockchain}
        transaction={transaction}
      />
    </ListItemCore>
  );
}

function _TransactionListItemEnriched({
  blockchain,
  transaction,
}: Omit<TransactionListItemProps, "onClick">) {
  const details = parseTransactionDescription(
    transaction.description ?? "",
    transaction.type ?? ""
  );

  return details ? (
    <YStack>
      <XStack flex={1} alignItems="center" justifyContent="space-between">
        <StyledText>{details.tl}</StyledText>
        <StyledText
          color={
            details.tr.startsWith("+")
              ? "$positive"
              : details.tr.startsWith("-")
              ? "$negative"
              : undefined
          }
        >
          {details.tr}
        </StyledText>
      </XStack>
      {(details.bl || details.br) ? <XStack flex={1} alignItems="center" justifyContent="space-between">
        <StyledText color="$secondary" fontSize="$xs">
          {details.bl ?? ""}
        </StyledText>
        <StyledText color="$secondary" fontSize="$xs">
          {details.br ?? ""}
        </StyledText>
      </XStack> : null}
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
