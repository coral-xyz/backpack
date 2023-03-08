import { Suspense, useCallback, useRef, useState } from "react";
import Autosizer from "react-virtualized-auto-sizer";
import { VariableSizeList } from "react-window";
import type { Blockchain, NftCollection } from "@coral-xyz/common";
import { Loading } from "@coral-xyz/react-common";
import {
  nftById,
  useAllWallets,
  useBlockchainConnectionUrl,
  useNavigation,
  useUser,
} from "@coral-xyz/recoil";
import type { CustomTheme } from "@coral-xyz/themes";
import { styled } from "@coral-xyz/themes";
import { Skeleton } from "@mui/material";
import { useRecoilValue } from "recoil";

import { Scrollbar } from "../../common/Layout/Scrollbar";
import { _BalancesTableHead } from "../Balances/Balances";

import { CollectionCard, NFTCard } from "./Cards";

export type AllWalletCollections = Array<{
  publicKey: string;
  collections: null | Array<NftCollection>;
}>;
type CollapsedCollections = boolean[];

type Row = {
  height: number;
  key: string;
  component: JSX.Element;
};

type collapseSingleCollection = (
  listIndex: number,
  blockchainCollectionIndex: number,
  isCollapsed: boolean
) => void;

export function NftTable({
  blockchainCollections,
  prependItems = [],
}: {
  prependItems?: Row[];
  blockchainCollections: AllWalletCollections;
}) {
  const [collapsedCollections, setCollapsedCollections] =
    useState<CollapsedCollections>(
      new Array(blockchainCollections.length).fill(false)
    );

  const ref = useRef<VariableSizeList>(null);

  const collapseSingleCollection: collapseSingleCollection = useCallback(
    (listIndex: number, blockchainIndex: number, isCollapsed: boolean) => {
      setCollapsedCollections((oldValue) => {
        const collapsed = [...oldValue];
        collapsed[blockchainIndex] = isCollapsed;
        return collapsed;
      });
      ref.current?.resetAfterIndex && ref.current?.resetAfterIndex(listIndex);
    },
    [setCollapsedCollections, ref]
  );

  const nftWidth = 174;

  return (
    <Autosizer>
      {({ width, height }) => {
        const numberOfItemsPerRow = Math.floor((width - 24) / nftWidth);
        return (
          <div
            style={{
              position: "relative",
              height: `${height}px`,
              width: `${width}px`,
              pointerEvents: "all",
            }}
          >
            <VariableSizeList
              key={JSON.stringify({
                blockchainCollections,
                numberOfItemsPerRow,
                prependItems: prependItems.length,
              })}
              ref={ref}
              itemKey={(i) => {
                const row = getItemForIndex(
                  i,
                  blockchainCollections,
                  collapsedCollections,
                  collapseSingleCollection,
                  numberOfItemsPerRow,
                  prependItems
                );
                return row ? row.key : 0;
              }}
              outerElementType={Scrollbar}
              height={height}
              width={width}
              itemCount={getNumberOfItems(
                blockchainCollections,
                collapsedCollections,
                numberOfItemsPerRow,
                prependItems
              )}
              itemSize={(i) => {
                const row = getItemForIndex(
                  i,
                  blockchainCollections,
                  collapsedCollections,
                  collapseSingleCollection,
                  numberOfItemsPerRow,
                  prependItems
                );
                return row ? row.height : 0;
              }}
              style={{ overflow: "hidden" }}
            >
              {({ index, style }) => {
                const row = getItemForIndex(
                  index,
                  blockchainCollections,
                  collapsedCollections,
                  collapseSingleCollection,
                  numberOfItemsPerRow,
                  prependItems
                );
                return row ? <div style={style}>{row.component}</div> : null;
              }}
            </VariableSizeList>
          </div>
        );
      }}
    </Autosizer>
  );
}

const HeaderRow = function HeaderRow({
  listIndex,
  blockchainIndex,
  blockchainCollections,
  isCollapsed,
  collapseSingleCollection,
}: {
  listIndex: number;
  blockchainIndex: number;
  blockchainCollections: AllWalletCollections;
  isCollapsed: boolean;
  collapseSingleCollection: collapseSingleCollection;
}) {
  const c = blockchainCollections[blockchainIndex];
  const wallets = useAllWallets();
  const wallet = wallets.find((wallet) => wallet.publicKey === c.publicKey);
  const blockchain = wallet?.blockchain;
  return (
    <CustomCard top bottom={isCollapsed}>
      <_BalancesTableHead
        blockchain={blockchain as Blockchain}
        wallet={wallet!}
        showContent={!isCollapsed}
        setShowContent={(isCollapsed) => {
          collapseSingleCollection(listIndex, blockchainIndex, !isCollapsed);
        }}
      />
    </CustomCard>
  );
};

const FooterRow = function () {
  return <CustomCard top={false} bottom />;
};

const LoadingRow = function ({ itemsPerRow }: { itemsPerRow: number }) {
  const items = new Array(itemsPerRow).fill(null);

  return (
    <CustomCard top={false} bottom={false}>
      <div
        style={{
          display: "flex",
          padding: `6px 6px ${6 + 26}px 6px`,
          justifyContent: "space-evenly",
          flex: "0 0 auto",
        }}
      >
        {items.map(() => {
          return (
            <div
              style={{
                position: "relative",
                width: "153.5px",
                height: `${153.5}px`,
                margin: "0px 6px",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <Skeleton
                style={{
                  height: "100%",
                  width: "100%",
                  transform: "none",
                  transformOrigin: "none",
                }}
              />
            </div>
          );
        })}
      </div>
    </CustomCard>
  );
};

const ItemRow = function ({
  blockchainIndex,
  itemStartIndex,
  itemsPerRow,
  blockchainCollections,
}: {
  blockchainIndex: number;
  itemStartIndex: number;
  itemsPerRow: number;
  blockchainCollections: AllWalletCollections;
}) {
  const c = blockchainCollections[blockchainIndex];

  const wallets = useAllWallets();
  const wallet = wallets.find((wallet) => wallet.publicKey === c.publicKey);
  const blockchain = wallet?.blockchain!;

  const collectionItems = c.collections!;
  const connectionUrl = useBlockchainConnectionUrl(blockchain);

  const numberOfItems =
    itemStartIndex + itemsPerRow <= collectionItems.length
      ? itemsPerRow
      : collectionItems.length % itemsPerRow;

  const items: any = new Array(itemsPerRow).fill(null);
  for (let i = itemStartIndex; i < itemStartIndex + numberOfItems; i++) {
    items[i - itemStartIndex] = collectionItems[i];
  }

  return (
    <CustomCard top={false} bottom={false}>
      <div
        style={{
          display: "flex",
          padding: "6px",
          justifyContent: "space-evenly",
          flex: "0 0 auto",
        }}
      >
        {items.map((collection: NftCollection, idx: number) => {
          return (
            <div
              key={collection ? collection.id : null}
              style={{
                position: "relative",
                width: "153.5px",
                height: `${153.5 + 26}px`,
                overflow: "hidden",
                margin: "0px 6px",
              }}
            >
              {collection ? (
                <Suspense fallback={<Loading />}>
                  <NftCollectionCard
                    publicKey={c.publicKey}
                    connectionUrl={connectionUrl}
                    collection={collection}
                  />
                </Suspense>
              ) : null}
            </div>
          );
        })}
      </div>
    </CustomCard>
  );
};

const CustomCard = styled("div")(
  ({ theme }: { theme: CustomTheme }) =>
    ({ top, bottom }: { top: boolean; bottom: boolean }) => ({
      position: "relative",
      backgroundColor: "inherit",
      marginLeft: "12px",
      marginRight: "12px",
      overflow: "hidden",
      borderLeft: theme.custom.colors.borderFull,
      borderRight: theme.custom.colors.borderFull,
      background: theme.custom.colors.nav,
      ...(top
        ? {
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
            borderTop: theme.custom.colors.borderFull,
          }
        : {}),
      ...(bottom
        ? {
            borderBottomLeftRadius: "12px",
            borderBottomRightRadius: "12px",
            borderBottom: theme.custom.colors.borderFull,
            marginBottom: "12px",
            minHeight: "12px",
          }
        : {}),
    })
);

function NftCollectionCard({
  publicKey,
  connectionUrl,
  collection,
}: {
  publicKey: string;
  connectionUrl: string;
  collection: NftCollection;
}) {
  const { uuid } = useUser();
  const { push } = useNavigation();
  // Display the first NFT in the collection as the thumbnail in the grid
  const collectionDisplayNftId = collection.itemIds?.find((nftId) => !!nftId)!;
  const collectionDisplayNft = useRecoilValue(
    nftById({
      publicKey,
      connectionUrl,
      nftId: collectionDisplayNftId,
    })
  );

  if (!collectionDisplayNft) {
    return null;
  }

  if (collection.itemIds.length > 1) {
    return <CollectionCard collection={collection} />;
  }

  return (
    <NFTCard
      nft={collectionDisplayNft}
      subtitle={{
        length: collection.itemIds.length,
        name: collectionDisplayNft.collectionName,
      }}
      showCollectionChat
    />
  );
}

const getNumberOfRowsInCollection = (
  items: Array<NftCollection> | null,
  itemsPerRow: number,
  isCollapsed: boolean
) => {
  let numberOfRowsInCollection = 0;

  if (items) {
    numberOfRowsInCollection = Math.ceil(items.length! / itemsPerRow);
  } else {
    // loading: when items == null -> show 1 item;
    numberOfRowsInCollection = 1;
  }

  if (isCollapsed) {
    numberOfRowsInCollection = -1;
  }
  return numberOfRowsInCollection;
};

const getItemForIndex = (
  index: number,
  blockchainCollections: AllWalletCollections,
  collapsedCollections: CollapsedCollections,
  collapseSingleCollection: collapseSingleCollection,
  itemsPerRow: number,
  prependItems: Row[]
): Row | null => {
  if (index < prependItems.length) {
    return prependItems[index];
  }
  index = index - prependItems.length;

  let result = 0;
  const blockchainIndex = blockchainCollections.findIndex((collection, i) => {
    const items = collection.collections;
    const isCollapsed = collapsedCollections[i];

    const numberOfRowsInCollection = getNumberOfRowsInCollection(
      items,
      itemsPerRow,
      isCollapsed
    );

    if (numberOfRowsInCollection === 0) {
      return false;
    }

    if (result + numberOfRowsInCollection + 2 <= index) {
      result += numberOfRowsInCollection + 2; // rows + header & footer
      return false;
    } else {
      return true;
    }
  });

  if (blockchainIndex < 0) {
    return null;
  }

  const isCollapsed = collapsedCollections[blockchainIndex];
  const collection = blockchainCollections[blockchainIndex];
  const collectionItems = collection ? collection.collections : null;

  const numberOfRowsInCollection = getNumberOfRowsInCollection(
    collectionItems,
    itemsPerRow,
    isCollapsed
  );

  const wrappedCollectionGroupIndex = index - result;
  const collectionGroupIndex = wrappedCollectionGroupIndex - 1; // remove header;

  if (wrappedCollectionGroupIndex === 0) {
    return {
      height: isCollapsed ? 52 : 36,
      key: `header${blockchainIndex}`,
      component: (
        <HeaderRow
          listIndex={index}
          blockchainIndex={blockchainIndex}
          blockchainCollections={blockchainCollections}
          isCollapsed={collapsedCollections[blockchainIndex]}
          collapseSingleCollection={collapseSingleCollection}
        />
      ),
    };
  }
  if (collectionGroupIndex >= numberOfRowsInCollection) {
    return {
      height: 24,
      key: `footer${blockchainIndex}`,
      component: <FooterRow />,
    };
  }
  const startIndex = collectionGroupIndex * itemsPerRow;

  if (!collectionItems) {
    return {
      height: 165.5 + 26,
      key: `loading${blockchainIndex}${itemsPerRow}`,
      component: <LoadingRow itemsPerRow={itemsPerRow} />,
    };
  }

  return {
    height: 165.5 + 26,
    key: `items${blockchainIndex}${startIndex}${itemsPerRow}`,
    component: (
      <ItemRow
        itemStartIndex={startIndex}
        blockchainIndex={blockchainIndex}
        blockchainCollections={blockchainCollections}
        itemsPerRow={itemsPerRow}
      />
    ),
  };
};

const getNumberOfItems = (
  collections: AllWalletCollections,
  collapsedCollections: CollapsedCollections,
  itemsPerRow: number,
  prependItems: Row[]
) => {
  const count = prependItems.length;
  return collections.reduce((count, collection, i) => {
    const items = collection.collections;
    const isCollapsed = collapsedCollections[i];

    // loading when items == null -> show 1 item;
    const numberOfRowsInCollection = getNumberOfRowsInCollection(
      items,
      itemsPerRow,
      isCollapsed
    );

    if (numberOfRowsInCollection == 0) {
      return count;
    }
    return count + numberOfRowsInCollection + 2;
  }, count);
};
