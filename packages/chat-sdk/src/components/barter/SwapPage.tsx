import React, { Suspense } from "react";
import type { BarterOffers } from "@coral-xyz/common";
import { BACKEND_API_URL, Blockchain } from "@coral-xyz/common";
import { SuccessButton } from "@coral-xyz/react-common";
import { useTokenMetadata } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { v4 as uuidv4 } from "uuid";

import { useChatContext } from "../ChatContext";

import { AddAssetsCard } from "./AddAssetsCard";
import { useBarterContext } from "./BarterContext";

export function SwapPage({
  remoteSelection,
  localSelection,
  finalized,
}: {
  finalized?: boolean;
  remoteSelection: BarterOffers;
  localSelection: BarterOffers;
}) {
  const theme = useCustomTheme();
  const { roomId, setOpenPlugin } = useChatContext();
  const { barterId } = useBarterContext();
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
          {!finalized && <AddAssetsCard />}
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
      <br />
      <SuccessButton
        label={"Execute"}
        onClick={async () => {
          await fetch(
            `${BACKEND_API_URL}/barter/execute?room=${roomId}&type=individual`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                barterId,
                clientGeneratedUuid: uuidv4(),
              }),
            }
          );
          setOpenPlugin("");
        }}
      >
        Execute
      </SuccessButton>
    </div>
  );
}

export function RemoteSelection({ selection }: { selection: BarterOffers }) {
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
        <Suspense fallback={() => <></>}>
          <RemoteNft mint={s.mint} />
        </Suspense>
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
  return (
    <div>
      {selection.map((s) => (
        <Suspense fallback={() => <></>}>
          <RemoteToken mint={s.mint} amount={s.amount} />
        </Suspense>
      ))}
    </div>
  );
}

function RemoteToken({ mint, amount }: { mint: string; amount: number }) {
  const tokenData = useTokenMetadata({
    mintAddress: mint,
    blockchain: Blockchain.SOLANA,
  });
  const theme = useCustomTheme();

  return (
    <div style={{ display: "flex" }}>
      <img style={{ width: 30, height: 30 }} src={tokenData?.image} />
      <div style={{ color: theme.custom.colors.background }}>
        {amount} {tokenData.name}
      </div>
    </div>
  );
}
