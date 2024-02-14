import type { ViewStyleWithPseudos } from "@coral-xyz/tamagui";
import { YStack } from "@coral-xyz/tamagui";

import { TransactionDetailsHeader } from "./TransactionDetailsHeader";
import { TransactionDetailsTable } from "./TransactionDetailsTable";
import type { ParseTransactionDetails } from "../parsing";
import type { ResponseTransaction } from "../utils";

export type TransactionDetailsProps = {
  containerStyle?: ViewStyleWithPseudos;
  details: ParseTransactionDetails;
  headerStyle?: ViewStyleWithPseudos;
  tableStyle?: ViewStyleWithPseudos;
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
    // @ts-expect-error null not equal to undefined | null | etc
    <YStack
      alignItems="center"
      gap={24}
      justifyContent="center"
      {...containerStyle}
    >
      <TransactionDetailsHeader style={headerStyle} details={details} />
      {details.details.headerText}
      <TransactionDetailsTable
        style={tableStyle}
        details={details}
        transaction={transaction}
      />
    </YStack>
  );
}
