import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
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
  SOLANA_CONNECT,
} from "react-xnft";
import { MangoClient, Config } from "@blockworks-foundation/mango-client";

//
// On connection to the host environment, warm the cache.
//
AnchorUi.events.on(SOLANA_CONNECT, () => {
  fetchRowData(window.xnft.solana.publicKey);
});

export function App() {
  return <MangoTable />;
}

function MangoTable() {
  const [rowData, setRowData] = useState<Array<any> | null>(null);
  useEffect(() => {
    (async () => {
      const { rowData } = await fetchRowData(window.xnft.solana.publicKey);
      setRowData(rowData);
    })();
  }, [window.xnft.solana.publicKey]);
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
                <BalancesTableRow key={row.mangoAccount.publicKey.toString()}>
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

async function fetchRowData(wallet: PublicKey): Promise<any> {
  let resp = CACHE.get(wallet.toString());
  if (resp) {
    return await resp;
  }
  const newResp = fetchRowDataInner(wallet);
  CACHE.set(wallet.toString(), newResp);
  return await newResp;
}

async function fetchRowDataInner(wallet: PublicKey) {
  const client = new MangoClient(window.xnft.solana.connection, MANGO_PID);
  const config = Config.ids().getGroupWithName("mainnet.1");
  if (!config) {
    throw new Error("config not found");
  }
  const mangoGroup = await client.getMangoGroup(config.publicKey);
  const mangoAccounts = await client.getMangoAccountsForOwner(
    mangoGroup,
    wallet
  );

  const mangoCache = await mangoGroup.loadCache(window.xnft.solana.connection);

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
  return {
    rowData,
    mangoGroup,
    mangoCache,
  };
}

const MANGO_PID = new PublicKey("mv3ekLzLbnVPNxjSKvqBpU3ZeZXPQdEC3bp5MDEBG68");

//
// Caches requests.
//
const CACHE = new Map<string, Promise<any>>();
