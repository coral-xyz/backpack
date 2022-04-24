import React, { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import {
  Text,
  BalancesTable,
  BalancesTableHead,
  BalancesTableContent,
  BalancesTableFooter,
  BalancesTableRow,
} from "@200ms/anchor-ui";
import { MangoClient } from "@blockworks-foundation/mango-client";

export function App() {
  return <MangoTable />;
}

function MangoTable() {
  const [mangoAccounts, setMangoAccounts] = useState<Array<any> | null>(null);

  useEffect(() => {
    (async () => {
      const client = new MangoClient(
        // @ts-ignore
        window.anchor.connection,
        MANGO_PID
      );
      const mangoGroup = await client.getMangoGroup(MANGO_GROUP);
      const mangoAccounts = await client.getMangoAccountsForOwner(
        mangoGroup,
        // @ts-ignore
        window.anchor.publicKey
      );
      setMangoAccounts(mangoAccounts);
    })();
  }, [setMangoAccounts]);

  if (mangoAccounts === null) {
    return <Text>Loading...</Text>;
  }

  return (
    <BalancesTable>
      <BalancesTableHead
        title={"Margin Accounts"}
        iconUrl={"https://trade.mango.markets/assets/icons/logo.svg"}
      />
      <BalancesTableContent>
        {mangoAccounts.map((ma: any) => {
          return (
            <BalancesTableRow>
              <Text>{JSON.stringify(ma)}</Text>
            </BalancesTableRow>
          );
        })}
      </BalancesTableContent>
      <BalancesTableFooter></BalancesTableFooter>
    </BalancesTable>
  );
}

const MANGO_GROUP = new PublicKey(
  "98pjRuQjK3qA6gXts96PqZT4Ze5QmnCmt3QYjhbUSPue"
);
const MANGO_PID = new PublicKey("mv3ekLzLbnVPNxjSKvqBpU3ZeZXPQdEC3bp5MDEBG68");
