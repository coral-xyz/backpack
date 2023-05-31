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

import { openWindow } from "../../utils/open";
import { useChatContext } from "../ChatContext";

import { AbsolutelyNothingCard } from "./AbsolutelyNothingCard";
import { AddAssetsCard } from "./AddAssetsCard";
import { useBarterContext } from "./BarterContext";
import { NftSkeleton } from "./SelectPage";

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
  const { roomId, setOpenPlugin, remoteUsername, sendMessage } =
    useChatContext();
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
            {!finalized ? (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <AddAssetsCard />
              </div>
            ) : null}
          </div>
          <div
            style={{
              flex: 1,
              color: theme.custom.colors.background,
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            {remoteSelection.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <AbsolutelyNothingCard />
              </div>
            ) : null}
            {remoteSelection.length !== 0 ? (
              <RemoteSelection selection={remoteSelection} />
            ) : null}
          </div>
        </div>
      </div>
      <div style={{ padding: 10 }}>
        {remoteSelection.length === 0 ? (
          <SecondaryButton
            label={`Request @${remoteUsername} to add assets`}
            onClick={async () => {
              sendMessage("Barter request", "barter-request", {
                barter_id: barterId.toString(),
              });
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
        ) : null}
        {remoteSelection.length !== 0 ? (
          <SecondaryButton
            label="Approve trade"
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
        ) : null}
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
      style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}
    >
      {selection.map((s) => (
        <div>
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
            <RemoteNftWithSuspense mint={s.mint} />
            <ExplorerLink mint={s.mint} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ExplorerLink({ mint }: { mint: string }) {
  const theme = useCustomTheme();

  return (
    <div
      style={{
        cursor: "pointer",
        color: theme.custom.colors.icon,
        display: "flex",
        justifyContent: "center",
      }}
      onClick={() => {
        openWindow(`https://explorer.solana.com/address/${mint}`, "_blank");
      }}
    >
      <div style={{ display: "flex" }}>
        <div>View</div> <CallMadeIcon />
      </div>
    </div>
  );
}

export function RemoteNftWithSuspense({
  mint,
  dimension,
  rounded = false,
  onClick,
}: {
  mint: string;
  dimension?: number;
  rounded?: boolean;
  onClick?: any;
}) {
  const theme = useCustomTheme();

  return (
    <Suspense fallback={<NftSkeleton rounded dimension={dimension} />}>
      <RemoteNft
        dimension={dimension}
        onClick={onClick}
        mint={mint}
        rounded={rounded}
      />
    </Suspense>
  );
}

export function RemoteNft({
  mint,
  rounded,
  onClick,
  dimension,
}: {
  mint: string;
  rounded?: boolean;
  onClick?: any;
  dimension?: number;
}) {
  const theme = useCustomTheme();
  const tokenData = useTokenMetadata({
    mintAddress: mint,
    blockchain: Blockchain.SOLANA,
  });

  return (
    <ProxyImage
      onClick={onClick}
      style={{
        width: "100%",
        height: dimension || "",
        borderRadius: rounded ? "50%" : 8,
        border: rounded ? `3px solid ${theme.custom.colors.bg3}` : "",
        boxShadow:
          "0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }}
      src={tokenData?.image}
      removeOnError
    />
  );
}

function RemoteTokens({ selection }: { selection: BarterOffers }) {
  return (
    <div
      style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}
    >
      {selection.map((s) => (
        <Suspense>
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
