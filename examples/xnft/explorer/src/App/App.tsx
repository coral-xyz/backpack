import CenteredLoader from "./CenteredLoader";
import React, { useEffect } from "react";
import ReactXnft, {
  Stack,
  Text,
  View,
  BalancesTable,
  BalancesTableHead,
  BalancesTableContent,
  BalancesTableFooter,
  BalancesTableRow,
  BalancesTableCell,
  SOLANA_CONNECT,
} from "react-xnft";
import { RecoilRoot } from "recoil";

import { useRecoilValueLoadable } from "recoil";
import Navigation from "./Navigation";
import filteredXnftsAtom from "./_atoms/filteredXnftsAtom";

export function App() {
  const xnfts = useRecoilValueLoadable(filteredXnftsAtom);

  if (xnfts.state === "loading") {
    return <CenteredLoader />;
  }
  if (xnfts.state === "hasError") {
    console.error(xnfts);
    return <Text>Error</Text>;
  }

  return (
    <View tw="bg-[#18181B] relative h-full">
      <Navigation />
    </View>
  );
}
