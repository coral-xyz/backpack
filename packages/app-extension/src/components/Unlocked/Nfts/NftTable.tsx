import { Suspense, useCallback, useRef, useState } from "react";
import Autosizer from "react-virtualized-auto-sizer";
import { VariableSizeList } from "react-window";
import type { Blockchain, NftCollection } from "@coral-xyz/common";
import { Loading } from "@coral-xyz/react-common";
import {
  nftById,
  useAllWallets,
  useBlockchainConnectionUrl,
} from "@coral-xyz/recoil";
import type { CustomTheme } from "@coral-xyz/themes";
import { styled } from "@coral-xyz/themes";
import { Skeleton } from "@mui/material";
import { useRecoilValue } from "recoil";

import { Scrollbar } from "../../common/Layout/Scrollbar";
import { _BalancesTableHead } from "../Balances/Balances";

import { CollectionCard } from "./CollectionEntry";
import { NFTCard } from "./NftEntry";

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

const HeaderRow = function () {
  return <CustomCard top bottom={false} />;
};

const FooterRow = function () {
  return <CustomCard top={false} bottom />;
};

export const LoadingRow = function ({ itemsPerRow }: { itemsPerRow: number }) {
  const items = new Array(itemsPerRow).fill(null);

  return (
    <CustomCard top={false} bottom={false}>
      <div
        style={{
          display: "flex",
          height: "191.5px",
          justifyContent: "space-between",
          flex: "0 0 auto",
          paddingLeft: "12px",
          paddingRight: "12px",
        }}
      >
        {items.map(() => {
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                marginTop: "6px",
              }}
            >
              <div
                style={{
                  width: "153.5px",
                  height: `153.5px`,
                  position: "relative",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <Skeleton
                  style={{
                    width: "153.5px",
                    height: `153.5px`,
                    transform: "none",
                    transformOrigin: "none",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    height: "26px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Skeleton
                    style={{
                      width: "100px",
                      height: `10.5px`,
                      transform: "none",
                      transformOrigin: "none",
                    }}
                  />
                </div>
              </div>
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
        {items.map((collection: NftCollection) => {
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
            minHeight: "12px",
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
      height: 12, //isCollapsed ? 52 : 36,
      key: `header${blockchainIndex}`,
      component: <HeaderRow />,
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
