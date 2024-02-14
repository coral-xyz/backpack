import type { ViewStyleWithPseudos } from "@coral-xyz/tamagui";
import { YStack } from "@coral-xyz/tamagui";
import type { ReactNode } from "react";

import {
  TransactionListItemIconDefault,
  TransactionListItemIconNft,
} from "../TransactionListItemIcon";
import type { ParseTransactionDetails } from "../parsing";

export type TransactionDetailsHeaderProps = {
  details: ParseTransactionDetails;
  style?: ViewStyleWithPseudos;
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
    // @ts-expect-error null is not equal ot undefined
    <YStack alignItems="center" justifyContent="center" width="100%" {...style}>
      {image}
    </YStack>
  );
}
