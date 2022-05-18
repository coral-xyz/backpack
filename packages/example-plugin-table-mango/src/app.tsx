import React, { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
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
import { MangoClient, Config } from "@blockworks-foundation/mango-client";

export function App() {
  return <MangoTable />;
}

function MangoTable() {
  const nav = useNavigation();
  const [rowData, setRowData] = useState<Array<any> | null>(null);
  useEffect(() => {
    (async () => {
      const { rowData, mangoGroup, mangoCache } = await fetchRowData();
      setRowData(rowData);
    })();
  }, []);
  return (
    <BalancesTable>
      <BalancesTableHead
        title={"Mango Markets"}
        iconUrl={"https://trade.mango.markets/assets/icons/logo.svg"}
      />
      {rowData && (
        <>
          <BalancesTableContent>
            {rowData.map((row) => {
              return (
                <BalancesTableRow
                  key={row.mangoAccount.publicKey.toString()}
                  onClick={() => nav.push(<MangoAccountDetail />)}
                >
                  <BalancesTableCell
                    title={row.title}
                    subtitle={row.subtitle}
                    icon={row.icon}
                    usdValue={row.usdValue}
                  />
                </BalancesTableRow>
              );
            })}
          </BalancesTableContent>
          <BalancesTableFooter></BalancesTableFooter>
        </>
      )}
    </BalancesTable>
  );
}

function MangoAccountDetail({}: any) {
  return (
    <View>
      <Text>Inside plugin: This is a detail view</Text>
    </View>
  );
}

async function fetchRowData(): Promise<any> {
  //
  // If we have a cached response, then use it.
  //
  let resp = CACHE.get(window.anchor.publicKey.toString());
  if (resp) {
    return resp;
  }
  const client = new MangoClient(window.anchor.connection, MANGO_PID);
  const config = Config.ids().getGroupWithName("mainnet.1");
  if (!config) {
    throw new Error("config not found");
  }
  const mangoGroup = await client.getMangoGroup(config.publicKey);
  const mangoAccounts = await client.getMangoAccountsForOwner(
    mangoGroup,
    window.anchor.publicKey
  );

  const mangoCache = await mangoGroup.loadCache(window.anchor.connection);

  const rowData = await Promise.all(
    mangoAccounts.map(async (ma) => {
      const d = {
        equityUi: (ma.getEquityUi(mangoGroup, mangoCache) * 10 ** 6).toFixed(1),
        leverage: ma.getLeverage(mangoGroup, mangoCache),
        health: `${ma
          .getHealthRatio(mangoGroup, mangoCache, "Maint")
          .toString()}%`,
      };
      return {
        mangoAccount: ma,
        title: "Margin Account",
        subtitle: `Health Ratio: ${d.health}`,
        icon: "https://trade.mango.markets/assets/icons/logo.svg",
        usdValue: d.equityUi,
      };
    })
  );
  const newResp = {
    rowData,
    mangoGroup,
    mangoCache,
  };

  CACHE.set(window.anchor.publicKey.toString(), newResp);
  return newResp;
}

const MANGO_PID = new PublicKey("mv3ekLzLbnVPNxjSKvqBpU3ZeZXPQdEC3bp5MDEBG68");

//
// Caches requests.
//
const CACHE = new Map<string, any>();
