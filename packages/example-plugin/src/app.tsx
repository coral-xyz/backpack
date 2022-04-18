import React, { useEffect, useState } from "react";
import { Market, OpenOrders } from "@project-serum/serum";
import { PublicKey } from "@solana/web3.js";
import {
  context,
  Text,
  View,
  Table,
  TableHead,
  TableRow,
} from "@200ms/anchor-ui";
import * as anchor from "@project-serum/anchor";

export function App() {
  return <Count />;
}

function Count() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setCount((c) => c + 1);
    }, 1000);
    return () => {
      clearTimeout(t);
    };
  }, [count]);

  return <Text style={{ backgroundColor: "red" }}>{count}</Text>;
}

function OpenOrdersComponent() {
  const [openOrders, setOpenOrders] = useState<Array<OpenOrders> | null>(null);
  const [marketMap, setMarketMap] = useState(new Map());

  useEffect(() => {
    fetchOpenOrdersData().then(([openOrders, marketMap]) => {
      setOpenOrders(openOrders);
      setMarketMap(marketMap);
    });
  }, [setOpenOrders, setMarketMap]);

  if (openOrders === null) {
    return <Text>Loading...</Text>;
  }

  return (
    <View>
      {openOrders.map((oo) => {
        return <Text>JSON.stringify(oo)</Text>;
      })}
    </View>
  );
}

async function fetchOpenOrdersData(): Promise<
  [Array<OpenOrders>, Map<string, Market>]
> {
  const ctx = context();

  //
  // All open orders accounts for this wallet.
  //
  const openOrders = await OpenOrders.findForOwner(
    ctx.connection,
    ctx.publicKey,
    PID
  );

  //
  // Maps market address string -> market client.
  //
  const marketMap = await (async () => {
    const markets = (() => {
      const markets = new Set<string>();
      this.openOrders.forEach((oo) => {
        markets.add(oo.market.toString());
      });
      return markets;
    })();

    const multipleMarkets = await anchor.utils.rpc.getMultipleAccounts(
      ctx.connection,
      Array.from(markets.values()).map((m) => new PublicKey(m))
    );
    return new Map(
      multipleMarkets.map((programAccount) => {
        return [
          programAccount!.publicKey.toString(),
          new Market(
            Market.getLayout(PID).decode(programAccount?.account.data),
            -1, // Not needed here.
            -1, // Not needed here.
            undefined,
            PID
          ),
        ];
      })
    );
  })();

  return [openOrders, marketMap];
}

const PID = new PublicKey("9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin");
