import React, { Suspense } from "react";
import type { BarterOffers } from "@coral-xyz/common";
import { BACKEND_API_URL, Blockchain } from "@coral-xyz/common";
import {
  ProxyImage,
  SecondaryButton,
  SuccessButton,
  useBreakpoints,
} from "@coral-xyz/react-common";
import { useTokenMetadata } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import CallMadeIcon from "@mui/icons-material/CallMade";
import { v4 as uuidv4 } from "uuid";

import { useChatContext } from "../ChatContext";

import { AbsolutelyNothingCard } from "./AbsolutelyNothingCard";
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
  const { roomId, setOpenPlugin, remoteUsername } = useChatContext();
  const { barterId } = useBarterContext();
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ flex: 1 }}>
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
            <RemoteSelection selection={localSelection} />
            {!finalized && (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <AddAssetsCard />
              </div>
            )}
          </div>
          <div
            style={{
              flex: 1,
              color: theme.custom.colors.background,
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            {remoteSelection.length === 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <AbsolutelyNothingCard />
              </div>
            )}
            {remoteSelection.length !== 0 && (
              <RemoteSelection selection={remoteSelection} />
            )}
          </div>
        </div>
      </div>
      <div style={{ padding: 10 }}>
        {remoteSelection.length === 0 && (
          <SecondaryButton
            label={`Request @${remoteUsername} to add assets`}
            onClick={async () => {
              /*await fetch(
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
                setOpenPlugin("");*/
            }}
          />
        )}
        {remoteSelection.length !== 0 && (
          <SecondaryButton
            label={"Approve trade"}
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
          />
        )}
      </div>
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
    <div
      style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}
    >
      {selection.map((s) => (
        <Suspense fallback={() => <></>}>
          <RemoteNft mint={s.mint} />
        </Suspense>
      ))}
    </div>
  );
}

function RemoteNft({ mint }: { mint: string }) {
  const { isXs } = useBreakpoints();
  const theme = useCustomTheme();
  const tokenData = useTokenMetadata({
    mintAddress: mint,
    blockchain: Blockchain.SOLANA,
  });
  const getDimensions = () => {
    if (isXs) {
      return 140;
    }
    return 170;
  };

  return (
    <div
      style={{
        position: "relative",
        margin: isXs ? 4 : 12,
        padding: 10,
        background: theme.custom.colors.invertedBg4,
        borderRadius: 8,
        width: getDimensions(),
      }}
    >
      <ProxyImage
        style={{
          borderRadius: 8,
          width: "100%",
        }}
        src={tokenData?.image}
        removeOnError={true}
      />
      <div
        style={{
          cursor: "pointer",
          color: theme.custom.colors.icon,
          display: "flex",
          justifyContent: "center",
        }}
        onClick={() => {
          window.open(`https://explorer.solana.com/address/${mint}`, "_blank");
        }}
      >
        <div style={{ display: "flex" }}>
          <div>View</div> <CallMadeIcon />
        </div>
      </div>
    </div>
  );
}

function RemoteTokens({ selection }: { selection: BarterOffers }) {
  return (
    <div
      style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}
    >
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
  const { isXs } = useBreakpoints();
  const getDimensions = () => {
    if (isXs) {
      return 140;
    }
    return 170;
  };

  return (
    <div
      style={{
        display: "flex",
        background: theme.custom.colors.invertedBg4,
        padding: 8,
        margin: isXs ? 4 : 12,
        borderRadius: 8,
        width: getDimensions(),
      }}
    >
      <div style={{ display: "flex" }}>
        <img
          style={{ width: 25, height: 25, borderRadius: "50%" }}
          src={tokenData?.image}
        />
      </div>
      <div
        style={{
          color: theme.custom.colors.background,
          fontSize: 12,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          marginLeft: 5,
        }}
      >
        <div>
          {amount} {tokenData?.name}
        </div>
      </div>
    </div>
  );
}
