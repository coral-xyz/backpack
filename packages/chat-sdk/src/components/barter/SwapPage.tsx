import React from "react";
import type { BarterOffers} from "@coral-xyz/common";
import { Blockchain } from "@coral-xyz/common";
import { useTokenMetadata } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";

import { AddAssetsCard } from "./AddAssetsCard";

export function SwapPage({ remoteSelection, localSelection }) {
  const theme = useCustomTheme();
  return (
    <div style={{ height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div
          style={{
            flex: 1,
            color: theme.custom.colors.background,
            fontSize: 16,
            fontWeight: 500,
            borderRight: `2px solid ${theme.custom.colors.icon}`,
          }}
        >
          <div style={{ fontSize: 25 }}>Your offer</div>
          <br />
          <RemoteSelection selection={localSelection} />
          <br />
          <AddAssetsCard />
        </div>
        <div
          style={{
            flex: 1,
            color: theme.custom.colors.background,
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          <div style={{ fontSize: 25 }}>Their offer</div>
          <br />
          <RemoteSelection selection={remoteSelection} />
        </div>
      </div>
    </div>
  );
}

function RemoteSelection({ selection }: { selection: BarterOffers }) {
  return (
    <div>
      <RemoteNfts selection={selection.filter((x) => x.type === "NFT")} />
      <RemoteTokens selection={selection.filter((x) => x.type === "TOKEN")} />
    </div>
  );
}

function RemoteNfts({ selection }: { selection: BarterOffers }) {
  return (
    <div style={{ display: "flex" }}>
      {selection.map((s) => (
        <RemoteNft mint={s.mint} />
      ))}
    </div>
  );
}

function RemoteNft({ mint }: { mint: string }) {
  const tokenData = useTokenMetadata({
    mintAddress: mint,
    blockchain: Blockchain.SOLANA,
  });
  return (
    <div style={{ background: "white" }}>
      <img style={{ width: 100, height: 100 }} src={tokenData.image} />
    </div>
  );
}

function RemoteTokens({ selection }: { selection: BarterOffers }) {
  return <div></div>;
}
