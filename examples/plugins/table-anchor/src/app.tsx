import { useEffect, useState } from "react";
import AnchorUi, {
  useNavigation,
  Text,
  View,
  BalancesTable,
  BalancesTableHead,
  BalancesTableContent,
  BalancesTableFooter,
  BalancesTableRow,
  BalancesTableCell,
} from "@200ms/anchor-ui";

const ANCHOR_ICON =
  "https://camo.githubusercontent.com/0542190d13e5a50f7d601abc4bfde84cf02af2ca786af519e78411f43f3ca9c0/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f3831333434343531343934393130333635382f3839303237383532303535333630333039322f6578706f72742e706e673f77696474683d373436266865696768743d373436";

//
// On connection to the host environment, warm the cache.
//
AnchorUi.events.on("connect", () => {
  //
});

export function App() {
  return <MangoTable />;
}

function MangoTable() {
  const nav = useNavigation();
  return (
    <BalancesTable>
      <BalancesTableHead title={"Anchor Dev Tools"} iconUrl={ANCHOR_ICON} />
      <BalancesTableContent>
        <BalancesTableRow onClick={() => nav.push(<AnchorDetail />)}>
          <BalancesTableCell
            title={"Anchor Shell"}
            subtitle={"Open an interactive shell"}
            icon={ANCHOR_ICON}
          />
        </BalancesTableRow>
      </BalancesTableContent>
      <BalancesTableFooter></BalancesTableFooter>
    </BalancesTable>
  );
}

function AnchorDetail({}: any) {
  return (
    <View>
      <Text>Inside plugin: This is a detail view</Text>
    </View>
  );
}
