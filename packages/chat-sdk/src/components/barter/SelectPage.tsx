import React, { useState } from "react";
import type { Nft } from "@coral-xyz/common";
import { Blockchain } from "@coral-xyz/common";
import { ProxyImage, TextInput } from "@coral-xyz/react-common";
import type {
  TokenDataWithPrice} from "@coral-xyz/recoil";
import {
  blockchainBalancesSorted,
  nftsByOwner,
  useActiveSolanaWallet,
  useLoader,
} from "@coral-xyz/recoil";
import { styled, useCustomTheme } from "@coral-xyz/themes";
import { useRecoilValueLoadable } from "recoil";

import { useBarterContext } from "./BarterContext";

export function SelectPage({
  currentSelection,
  remoteSelection,
}: {
  currentSelection: string[];
  remoteSelection: string[];
}) {
  const { setSelectNft } = useBarterContext();
  const activeSolWallet = useActiveSolanaWallet();
  const [localSelection, setLocalSelection] = useState(currentSelection);

  const { contents, state } = useRecoilValueLoadable(
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
      {tokenAccounts.map((tokenAccount) => (
        <TokenSelector tokenAccount={tokenAccount} />
      ))}
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: theme.custom.colors.background }}>
            {contents?.map((nft) => (
              <>
                <RenderNFT
                  nft={nft}
                  selected={localSelection.includes(nft.mint)}
                  setLocalSelection={setLocalSelection}
                />
              </>
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          {contents?.map((nft) => (
            <>
              <RenderNFT
                nft={nft}
                selected={localSelection.includes(nft.mint)}
              />
            </>
          ))}
        </div>
      </div>
    </div>
  );
}

function TokenSelector({ tokenAccount }: { tokenAccount: TokenDataWithPrice }) {
  const [selectedValue, setSelectedValue] = useState("0");
  const theme = useCustomTheme();

  return (
    <div style={{ color: theme.custom.colors.background, display: "flex" }}>
      You have {tokenAccount.displayBalance} {tokenAccount.ticker}{" "}
      <div style={{ width: 100 }}>
        {" "}
        <TextInput
          value={selectedValue}
          setValue={(e) => setSelectedValue(e.target.value)}
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
  return (
    <StyledProxyImage
      onClick={() => {
        setLocalSelection((s) => {
          if (s.includes(nft.mint)) {
            return s.filter((x) => x !== nft.mint);
          }
          return [...s, nft.mint];
        });
      }}
      style={{
        width: "55px",
        height: "55px",
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
