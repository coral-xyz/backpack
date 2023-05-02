import React, { useEffect, useState } from "react";
import type { BarterOffers, Nft } from "@coral-xyz/common";
import { BACKEND_API_URL, Blockchain } from "@coral-xyz/common";
import {
  Loading,
  PrimaryButton,
  ProxyImage,
  SecondaryButton,
  TextInput,
  useBreakpoints,
} from "@coral-xyz/react-common";
import type { TokenDataWithPrice } from "@coral-xyz/recoil";
import {
  blockchainBalancesSorted,
  nftsByOwner,
  useActiveSolanaWallet,
  useLoader,
  useTokenMetadata,
} from "@coral-xyz/recoil";
import { styled, useCustomTheme } from "@coral-xyz/themes";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Skeleton, TextField } from "@mui/material";
import { useRecoilValueLoadable } from "recoil";

import { useBarterContext } from "./BarterContext";
import { CheckMark } from "./CheckMark";

export function SelectPage({
  currentSelection,
  setBarterState,
}: {
  currentSelection: BarterOffers;
  setBarterState: any;
}) {
  const { setSelectNft, room, barterId } = useBarterContext();
  const [localSelection, setLocalSelection] =
    useState<BarterOffers>(currentSelection);

  const [activeTab, setActiveTab] = useState("nfts");
  const activeSolWallet = useActiveSolanaWallet();

  const theme = useCustomTheme();

  return (
    <div style={{ flex: 1 }}>
      <div
        style={{
          color: theme.custom.colors.background,
          borderBottom: `1px solid ${theme.custom.colors.icon}`,
          display: "flex",
          marginTop: 10,
          paddingTop: 16,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "space-between",
            marginRight: 4,
          }}
        >
          <div
            style={{ cursor: "pointer", marginLeft: 15 }}
            onClick={() => {
              setSelectNft(false);
            }}
          >
            <ArrowBackIcon />
          </div>
          <div
            style={{
              fontSize: 18,
              cursor: "pointer",
              borderBottom:
                activeTab === "nfts"
                  ? `2px solid ${theme.custom.colors.background}`
                  : "",
              fontWeight: 500,
              paddingBottom: 16,
            }}
            onClick={() => setActiveTab("nfts")}
          >
            Collectibles
          </div>
        </div>
        <div
          style={{
            fontSize: 18,
            cursor: "pointer",
            flex: 1,
            marginLeft: 4,
            display: "flex",
          }}
        >
          <div
            style={{
              borderBottom:
                activeTab !== "nfts"
                  ? `2px solid ${theme.custom.colors.background}`
                  : "",
              fontWeight: 500,
              fontSize: 16,
              paddingBottom: 16,
            }}
            onClick={() => setActiveTab("tokens")}
          >
            Tokens
          </div>
        </div>
      </div>
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          {activeTab !== "nfts" ? (
            <Tokens
              localSelection={localSelection}
              setLocalSelection={setLocalSelection}
            />
          ) : null}
          {activeTab === "nfts" ? (
            <Nfts
              onSelect={(nft: Nft) => {
                setLocalSelection((s: any) => {
                  if (s.map((x) => x.mint).includes(nft.mint || "")) {
                    return s.filter((x) => x.mint !== nft.mint);
                  }
                  return [
                    ...s,
                    {
                      mint: nft.mint,
                      publicKey: activeSolWallet.publicKey,
                      amount: 1,
                      type: "NFT",
                    },
                  ];
                });
              }}
              localSelection={localSelection}
              setLocalSelection={setLocalSelection}
            />
          ) : null}
        </div>
        <div style={{ justifyContent: "center", padding: 10 }}>
          <SecondaryButton
            fullWidth
            label="Update Trade"
            onClick={async () => {
              await fetch(
                `${BACKEND_API_URL}/barter/active?room=${room}&type=individual`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    updatedOffer: localSelection,
                    barterId,
                  }),
                }
              );
              setBarterState((state) => ({
                ...state,
                localOffers: localSelection,
              }));
              setSelectNft(false);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function NftsSkeleton() {
  const { isXs } = useBreakpoints();

  const getDimensions = () => {
    if (isXs) {
      return 80;
    }
    return 120;
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <NftSkeleton />
      <NftSkeleton />
      <NftSkeleton />
      <NftSkeleton />
    </div>
  );
}

export function NftSkeleton({
  dimension,
  rounded,
}: {
  dimension?: number;
  rounded?: boolean;
}) {
  const { isXs } = useBreakpoints();

  const getDimensions = () => {
    if (isXs) {
      return 80;
    }
    return 120;
  };

  return (
    <Skeleton
      variant="rectangular"
      height={dimension ?? getDimensions()}
      width={dimension ?? getDimensions()}
      style={{ margin: isXs ? 4 : 12, borderRadius: rounded ? "50%" : 0 }}
    />
  );
}

export function Nfts({ localSelection, onSelect, rounded }: any) {
  const activeSolWallet = useActiveSolanaWallet();
  const { contents, state }: any = useRecoilValueLoadable(
    nftsByOwner({
      publicKey: activeSolWallet.publicKey,
      blockchain: Blockchain.SOLANA,
    })
  );
  // contents sometimes returns an empty array even if the user has nfts.
  // This variable makes sure the loader shows up instead of `you dont have any nfts`
  const [loadingThreshold, setloadingThreshold] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setloadingThreshold(false);
    }, 1500);
  }, []);

  const theme = useCustomTheme();

  if (state === "loading" || state === "hasError") {
    return (
      <div style={{ height: "100%", marginTop: 60 }}>
        {" "}
        <Loading />{" "}
      </div>
    );
  }

  if (!contents.length && loadingThreshold) {
    return (
      <div style={{ height: "100%", marginTop: 60 }}>
        {" "}
        <Loading />{" "}
      </div>
    );
  }

  if (!contents.length) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            fontSize: 18,
            color: theme.custom.colors.fontColor,
            marginTop: 80,
          }}
        >
          You don't own any NFTs yet
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              color: theme.custom.colors.background,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {contents?.map((nft) => (
              <div>
                <RenderNFT
                  rounded={rounded}
                  nft={nft}
                  selected={localSelection
                    .map((x) => x.mint)
                    .includes(nft?.mint)}
                  onSelect={onSelect}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Tokens({ localSelection, setLocalSelection }: any) {
  const activeSolWallet = useActiveSolanaWallet();
  const [tokenAccounts, , isLoading] = useLoader(
    blockchainBalancesSorted({
      publicKey: activeSolWallet.publicKey,
      blockchain: Blockchain.SOLANA,
    }),
    [],
    [activeSolWallet]
  );
  const theme = useCustomTheme();

  if (isLoading) {
    //TODO: adda skeletons here
    return <div />;
  }

  return (
    <div style={{ marginTop: 15, paddingLeft: 10, paddingRight: 10 }}>
      <div
        style={{
          display: "flex",
          fontSize: 14,
          color: theme.custom.colors.icon,
        }}
      >
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          Name
        </div>
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          Available
        </div>
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          Trade amount
        </div>
      </div>
      {tokenAccounts.map((tokenAccount) => (
        <TokenSelector
          amount={
            localSelection.find((x) => x.mint === tokenAccount.mint)?.amount ||
            0
          }
          setLocalSelection={setLocalSelection}
          tokenAccount={tokenAccount}
        />
      ))}
    </div>
  );
}

function TokenSelector({
  tokenAccount,
  setLocalSelection,
  amount,
}: {
  tokenAccount: TokenDataWithPrice;
  setLocalSelection: any;
  amount: string;
}) {
  const theme = useCustomTheme();
  const activeSolWallet = useActiveSolanaWallet();

  return (
    <div
      style={{
        color: theme.custom.colors.background,
        display: "flex",
        fontSize: 16,
        fontWeight: 500,
        padding: 4,
      }}
    >
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex" }}>
            <img
              src={tokenAccount.logo}
              style={{ width: 25, height: 25, marginRight: 4 }}
            />
            <div style={{ textOverflow: "ellipses" }}>
              {tokenAccount.ticker}
            </div>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div>{tokenAccount.displayBalance}</div>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <TextField
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: theme.custom.colors.bg4,
                borderRadius: 6,
              },
              "&:hover fieldset": {
                borderColor: theme.custom.colors.bg4,
              },
              "&.Mui-focused fieldset": {
                borderColor: "#4C94FF",
              },
            },
            input: {
              padding: "12px 12px",
              color: theme.custom.colors.background,
            },
          }}
          value={amount}
          onChange={(e) => {
            const updatedValue = parseFloat(e.target.value);
            if (isNaN(updatedValue) || updatedValue === 0) {
              setLocalSelection((s) =>
                s.filter((x) => x.mint !== tokenAccount.mint)
              );
            } else {
              setLocalSelection((s) => {
                return [
                  ...s.filter((x) => x.mint !== tokenAccount.mint),
                  {
                    mint: tokenAccount.mint,
                    publicKey: activeSolWallet.publicKey,
                    amount: updatedValue,
                    type: "TOKEN",
                  },
                ];
              });
            }
          }}
        />{" "}
      </div>
    </div>
  );
}

function RenderNFT({
  nft,
  selected,
  onSelect,
  rounded = false,
}: {
  nft: Nft;
  selected: boolean;
  onSelect: any;
  rounded?: boolean;
}) {
  const { isXs } = useBreakpoints();
  const theme = useCustomTheme();

  const getDimensions = () => {
    if (isXs) {
      return 72;
    }
    return 120;
  };

  return (
    <div style={{ position: "relative", margin: isXs ? 4 : 12 }}>
      <StyledProxyImage
        onClick={() => {
          onSelect(nft);
        }}
        style={{
          width: getDimensions(),
          height: getDimensions(),
          borderRadius: rounded ? "50%" : 8,
          boxShadow:
            "0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06);",
          border: `3px solid ${theme.custom.colors.background}`,
        }}
        src={nft?.imageUrl}
        removeOnError
      />
      {selected ? (
        <div style={{ position: "absolute", right: 10, top: 8 }}>
          {" "}
          <CheckMark />{" "}
        </div>
      ) : null}
    </div>
  );
}

const StyledProxyImage = styled(ProxyImage)(({ theme }) => ({
  "&:hover": {
    border: `3px solid ${theme.custom.colors.avatarIconBackground}`,
    cursor: "pointer",
  },
}));
