import React from "react";
import {
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

const icon = "https://aux.iconspalace.com/uploads/finder-circle-icon-256.png";

export function App() {
  return <HelloWorld />;
}

function HelloWorld() {
  const nav = useNavigation();
  return (
    <BalancesTable>
      <BalancesTableHead title={"Hello World"} iconUrl={icon} />
      <BalancesTableContent>
        <BalancesTableRow onClick={() => nav.push(<HelloWorldDetail />)}>
          <BalancesTableCell
            title={"Hello World"}
            subtitle={"Open an test thing"}
            icon={icon}
          />
        </BalancesTableRow>
      </BalancesTableContent>
      <BalancesTableFooter></BalancesTableFooter>
    </BalancesTable>
  );
}

function HelloWorldDetail({}: any) {
  return (
    <View>
      <Text>Hello World!</Text>
    </View>
  );
}
