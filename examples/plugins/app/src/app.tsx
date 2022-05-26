import React, { useEffect, useState } from "react";
import { Market, OpenOrders } from "@project-serum/serum";
import { PublicKey } from "@solana/web3.js";
import { Text, View } from "@200ms/anchor-ui";
import * as anchor from "@project-serum/anchor";

export function App() {
  return (
    <View>
      <Count />
      <OpenOrdersAccounts />
    </View>
  );
}

function Count() {
  const [backgroundColor, setBackgroundColor] = useState("blue");
  const [count, setCount] = useState(0);
  const onClick = async () => {
    setBackgroundColor((backgroundColor) =>
      backgroundColor === "blue" ? "red" : "blue"
    );
  };
  useEffect(() => {
    const t = setTimeout(() => {
      setCount((c) => c + 1);
    }, 1000);
    return () => {
      clearTimeout(t);
    };
  }, [count]);

  return (
    <View style={{ backgroundColor }} onClick={onClick}>
      <Text>{count}</Text>
    </View>
  );
}

function OpenOrdersAccounts() {
  const [openOrders, setOpenOrders] = useState<Array<OpenOrders> | null>(null);
  const [marketMap, setMarketMap] = useState(new Map());

  useEffect(() => {
    fetchOpenOrdersData().then(([newOpenOrders, marketMap]) => {
      setOpenOrders(newOpenOrders);
      setMarketMap(marketMap);
    });
  }, [setOpenOrders, setMarketMap]);

  if (openOrders === null) {
    return <Text>Loading...</Text>;
  }

  return (
    <View>
      {openOrders.map((oo) => {
        return <Text key={oo.address.toString()}>{JSON.stringify(oo)}</Text>;
      })}
    </View>
  );
}

async function fetchOpenOrdersData(): Promise<
  [Array<OpenOrders>, Map<string, Market>]
> {
  //
  // All open orders accounts for this wallet.
  //
  const openOrders = await OpenOrders.findForOwner(
    window.anchorUi.connection,
    window.anchorUi.publicKey,
    PID
  );

  //
  // Maps market address string -> market client.
  //
  const marketMap = await (async () => {
    const markets = (() => {
      const markets = new Set<string>();
      openOrders.forEach((oo) => {
        markets.add(oo.market.toString());
      });
      return markets;
    })();

    const multipleMarkets = await anchor.utils.rpc.getMultipleAccounts(
      window.anchorUi.connection,
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
