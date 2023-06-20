import { useMemo } from "react";
import { EmptyState } from "@coral-xyz/react-common";
import {
  isAggregateWallets,
  isOneLive,
  nftCollectionsWithIds,
  useActiveWallet,
  useAllWalletsDisplayed,
} from "@coral-xyz/recoil";
import { Image as ImageIcon } from "@mui/icons-material";
import { useRecoilValue, useRecoilValueLoadable } from "recoil";

import { _BalancesTableHead } from "../Balances/Balances";

import EntryONE from "./EntryONE";
import { NftTable } from "./NftTable";

export function Nfts() {
  const oneLiveLoadable = useRecoilValueLoadable(isOneLive);
  const activeWallet = useActiveWallet();
  const wallets = useAllWalletsDisplayed();
  const _isAggregateWallets = useRecoilValue(isAggregateWallets);
  const { contents, state } = useRecoilValueLoadable(nftCollectionsWithIds);
  const isLoading = state === "loading";
  const allWalletCollections = (state === "hasValue" && contents) || null;
  const oneLive =
    oneLiveLoadable.state === "hasValue"
      ? oneLiveLoadable.contents
      : { isLive: false };
  const NFTList = useMemo(() => {
    return (
      <NftTable
        prependItems={
          oneLive.isLive
            ? [
                {
                  height: 129,
                  key: "oneEntry",
                  component: (
                    <EntryONE allWalletCollections={allWalletCollections} />
                  ),
                },
              ]
            : []
        }
        blockchainCollections={
          allWalletCollections ??
          wallets.map((w) => ({ publicKey: w.publicKey, collections: null })) // Still loading.
        }
      />
    );
  }, [oneLive, allWalletCollections]);

  const nftCount = allWalletCollections
    ? allWalletCollections
        .map((c: any) => c.collections)
        .flat()
        .reduce((acc, c) => (c === null ? acc : c.itemIds.length + acc), 0)
    : 0;
  const isEmpty = nftCount === 0 && !isLoading;
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        zIndex: 0,
      }}
    >
      {isEmpty ? (
        <>
          {oneLive.isLive ? (
            <EntryONE allWalletCollections={allWalletCollections} />
          ) : null}
          <EmptyState
            icon={(props: any) => <ImageIcon {...props} />}
            title="No NFTs"
            subtitle="Get started with your first NFT"
            buttonText="Browse Magic Eden"
            onClick={() => window.open("https://magiceden.io")}
            verticallyCentered={!oneLive}
            header={
              !_isAggregateWallets ? (
                <_BalancesTableHead
                  blockchain={activeWallet.blockchain}
                  showContent
                  setShowContent={() => {}}
                />
              ) : null
            }
            style={{
              height: !oneLive.isLive ? "100%" : undefined,
            }}
          />
        </>
      ) : (
        <div style={{ display: "flex", flex: 1, position: "relative" }}>
          {NFTList}
        </div>
      )}
    </div>
  );
}
