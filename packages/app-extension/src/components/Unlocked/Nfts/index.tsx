import { useMemo } from "react";
import { EmptyState } from "@coral-xyz/react-common";
import {
  isAggregateWallets,
  nftCollectionsWithIds,
  useActiveWallet,
  useAllWalletsDisplayed,
} from "@coral-xyz/recoil";
import { Image as ImageIcon } from "@mui/icons-material";
import { useRecoilValue, useRecoilValueLoadable } from "recoil";

import { useIsONELive } from "../../../hooks/useIsONELive";
import { _BalancesTableHead } from "../Balances/Balances";

import EntryONE from "./EntryONE";
import { NftTable } from "./NftTable";

export function Nfts() {
  const isONELive = useIsONELive();
  const activeWallet = useActiveWallet();
  const wallets = useAllWalletsDisplayed();
  const _isAggregateWallets = useRecoilValue(isAggregateWallets);
  const { contents, state } = useRecoilValueLoadable(nftCollectionsWithIds);
  const isLoading = state === "loading";
  const collections = (state === "hasValue" && contents) || null;

  const NFTList = useMemo(() => {
    return (
      <NftTable
        prependItems={
          isONELive
            ? [{ height: 129, key: "oneEntry", component: <EntryONE /> }]
            : []
        }
        blockchainCollections={
          collections
            ? Object.entries(collections).map(([publicKey, c]) => ({
                publicKey,
                blockchain: c.blockchain,
                collectionWithIds: c.collectionWithIds,
              }))
            : // Set some empty collections so that the loading indicator displays.
              wallets.map((w) => ({ ...w, collectionWithIds: null }))
        }
      />
    );
  }, [isONELive, collections]);

  const nftCount = collections
    ? Object.values(collections)
        .flat()
        .reduce(
          (acc, c) =>
            c.collectionWithIds === null
              ? acc
              : c.collectionWithIds.length + acc,
          0
        )
    : 0;
  const isEmpty = nftCount === 0 && !isLoading;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {isEmpty ? (
        <>
          {isONELive && <EntryONE />}
          <EmptyState
            icon={(props: any) => <ImageIcon {...props} />}
            title={"No NFTs"}
            subtitle={"Get started with your first NFT"}
            buttonText={"Browse Magic Eden"}
            onClick={() => window.open("https://magiceden.io")}
            verticallyCentered={!isONELive}
            header={
              !_isAggregateWallets && (
                <_BalancesTableHead
                  blockchain={activeWallet.blockchain}
                  wallet={activeWallet}
                  showContent={true}
                  setShowContent={() => {}}
                />
              )
            }
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
