import React, { useState } from "react";
import type { BarterOffers, Nft } from "@coral-xyz/common";
import { BACKEND_API_URL, Blockchain } from "@coral-xyz/common";
import { PrimaryButton, ProxyImage, TextInput } from "@coral-xyz/react-common";
import type { TokenDataWithPrice } from "@coral-xyz/recoil";
import {
  blockchainBalancesSorted,
  nftsByIds,
  nftsByOwner,
  useActiveSolanaWallet,
  useLoader,
  useTokenMetadata,
} from "@coral-xyz/recoil";
import { styled, useCustomTheme } from "@coral-xyz/themes";
import { useRecoilValueLoadable } from "recoil";

import { useBarterContext } from "./BarterContext";

export function SelectPage({
  currentSelection,
  setBarterState,
}: {
  currentSelection: BarterOffers;
  setBarterState: any;
}) {
  const { setSelectNft, room, barterId } = useBarterContext();
  const activeSolWallet = useActiveSolanaWallet();
  const [localSelection, setLocalSelection] =
    useState<BarterOffers>(currentSelection);

  const { contents, state }: any = useRecoilValueLoadable(
    nftsByOwner({
      publicKey: activeSolWallet.publicKey,
      blockchain: Blockchain.SOLANA,
    })
  );

  const [tokenAccounts, , isLoading] = useLoader(
    blockchainBalancesSorted({
      publicKey: activeSolWallet.publicKey,
      blockchain: Blockchain.SOLANA,
    }),
    [],
    [activeSolWallet]
  );

  const theme = useCustomTheme();

  if (state === "loading" || state === "hasError" || isLoading) {
    return <></>;
  }

  return (
    <div>
      <div
        style={{ color: theme.custom.colors.background }}
        onClick={() => {
          setSelectNft(false);
        }}
      >
        Back
      </div>
      <br />
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
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: theme.custom.colors.background }}>
            {contents?.map((nft) => (
              <>
                <RenderNFT
                  nft={nft}
                  selected={localSelection
                    .map((x) => x.mint)
                    .includes(nft.mint)}
                  setLocalSelection={setLocalSelection}
                />
              </>
            ))}
          </div>
        </div>
      </div>

      <br />
      <br />
      <PrimaryButton
        style={{
          background: theme.custom.colors.background,
          color: theme.custom.colors.fontColor,
        }}
        label={"Update"}
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
      ></PrimaryButton>
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
    <div style={{ color: theme.custom.colors.background, display: "flex" }}>
      You have {tokenAccount.displayBalance} {tokenAccount.ticker}{" "}
      <div style={{ width: 100 }}>
        {" "}
        <TextInput
          value={amount}
          setValue={(e) => {
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
  setLocalSelection,
}: {
  nft: Nft;
  selected: boolean;
  setLocalSelection: any;
}) {
  const activeSolWallet = useActiveSolanaWallet();

  return (
    <StyledProxyImage
      onClick={() => {
        setLocalSelection((s) => {
          if (s.map((x) => x.mint).includes(nft.mint)) {
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
      style={{
        width: "100px",
        height: "100px",
        margin: "16px 0px 0px 16px",
        border: selected ? "8px solid green" : "3px solid black",
      }}
      src={nft.imageUrl}
      removeOnError={true}
    />
  );
}

const StyledProxyImage = styled(ProxyImage)(({ theme }) => ({
  "&:hover": {
    border: `3px solid ${theme.custom.colors.avatarIconBackground}`,
    cursor: "pointer",
  },
}));
