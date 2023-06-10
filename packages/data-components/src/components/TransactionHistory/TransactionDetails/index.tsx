import type { ViewStyle } from "react-native";
import { YStack } from "@coral-xyz/tamagui";

import type { ResponseTransaction } from "..";
import type { ParseTransactionDetails } from "../parsing";

import { TransactionDetailsHeader } from "./TransactionDetailsHeader";
import { TransactionDetailsTable } from "./TransactionDetailsTable";

export type TransactionDetailsProps = {
  containerStyle?: ViewStyle;
  details: ParseTransactionDetails;
  headerStyle?: ViewStyle;
  tableStyle?: ViewStyle;
  transaction: ResponseTransaction;
};

export function TransactionDetails({
  containerStyle,
  details,
  headerStyle,
  tableStyle,
  transaction,
}: TransactionDetailsProps) {
  return (
    <YStack
      alignItems="center"
      gap={24}
      justifyContent="center"
      {...containerStyle}
    >
      <TransactionDetailsHeader style={headerStyle} details={details} />
      <TransactionDetailsTable
        style={tableStyle}
        details={details}
        transaction={transaction}
      />
    </YStack>
  );
}
