import type { ReactNode } from "react";
import type { ViewStyle } from "react-native";
import { YStack } from "@coral-xyz/tamagui";

import type { ParseTransactionDetails } from "../parsing";
import {
  TransactionListItemIconDefault,
  TransactionListItemIconNft,
} from "../TransactionListItemIcon";

export type TransactionDetailsHeaderProps = {
  details: ParseTransactionDetails;
  style?: ViewStyle;
};

export function TransactionDetailsHeader({
  details,
  style,
}: TransactionDetailsHeaderProps) {
  let image: ReactNode;
  if (details.details.nft) {
    image = (
      <TransactionListItemIconNft mint={details.details.nft} size={200} />
    );
  } else if (details.details.icon) {
    image = details.details.icon;
  } else {
    image = <TransactionListItemIconDefault size={100} />;
  }

  return (
    <YStack alignItems="center" justifyContent="center" width="100%" {...style}>
      {image}
    </YStack>
  );
}
