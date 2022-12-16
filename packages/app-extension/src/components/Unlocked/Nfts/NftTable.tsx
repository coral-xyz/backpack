import React, {
  AllHTMLAttributes,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import Autosizer from "react-virtualized-auto-sizer";
import type { ListChildComponentProps } from "react-window";
import { VariableSizeList } from "react-window";
import type { Blockchain, NftCollection } from "@coral-xyz/common";
import {
  NAV_COMPONENT_NFT_COLLECTION,
  NAV_COMPONENT_NFT_DETAIL,
} from "@coral-xyz/common";
import { useNavigation } from "@coral-xyz/recoil";
import { styled } from "@coral-xyz/themes";
import { Typography } from "@mui/material";

import { Scrollbar } from "../../common/Layout/Scrollbar";
import { BlockchainHeader } from "../Settings/AvatarHeader/BlockchainHeader";

import { GridCard } from "./Common";

type BlockchainCollections = [string, NftCollection[]][];
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
  blockchainCollections: BlockchainCollections;
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
                return useMemo(
                  () => (row ? <div style={style}>{row.component}</div> : null),
                  [row?.key]
                );
              }}
            </VariableSizeList>
          </div>
        );
      }}
    </Autosizer>
  );
}

const HeaderRow = function ({
  listIndex,
  blockchainIndex,
  blockchainCollections,
  isCollapsed,
  collapseSingleCollection,
}: {
  listIndex: number;
  blockchainIndex: number;
  blockchainCollections: BlockchainCollections;
  isCollapsed: boolean;
  collapseSingleCollection: collapseSingleCollection;
}) {
  const [blockchain] = blockchainCollections[blockchainIndex];
  return (
    <>
      <Card top={true} bottom={isCollapsed}>
        <BlockchainHeader
          setShowContent={(isCollapsed) => {
            collapseSingleCollection(listIndex, blockchainIndex, !isCollapsed);
          }}
          showContent={!isCollapsed}
          blockchain={blockchain as Blockchain}
        />
      </Card>
    </>
  );
};
const FooterRow = function () {
  return <Card top={false} bottom={true} />;
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
  blockchainCollections: BlockchainCollections;
}) {
  const collectionItems = blockchainCollections[blockchainIndex][1];
  const numberOfItems =
    itemStartIndex + itemsPerRow <= collectionItems.length
      ? itemsPerRow
      : collectionItems.length % itemsPerRow;

  const items: NftCollection[] = new Array(itemsPerRow).fill(null);
  for (let i = itemStartIndex; i < itemStartIndex + numberOfItems; i++) {
    items[i - itemStartIndex] = collectionItems[i];
  }
  return (
    <Card top={false} bottom={false}>
      <div
        style={{
          display: "flex",
          padding: "6px",
          justifyContent: "space-evenly",
          flex: "0 0 auto",
        }}
      >
        {items.map((collection) => {
          return (
            <div
              style={{
                position: "relative",
                width: "150px",
                margin: "6px",
              }}
            >
              {collection && <NftCollectionCard collection={collection} />}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const Card = styled("div")(
  ({ theme }) =>
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

function NftCollectionCard({ collection }: { collection: NftCollection }) {
  const { push } = useNavigation();
  // Display the first NFT in the collection as the thumbnail in the grid
  const collectionDisplayNft = collection.items[0];

  const onClick = () => {
    if (collection.items.length === 1) {
      if (!collectionDisplayNft.name || !collectionDisplayNft.id) {
        throw new Error("invalid NFT data");
      }
      // If there is only one item in the collection, link straight to its detail page
      push({
        title: collectionDisplayNft.name || "",
        componentId: NAV_COMPONENT_NFT_DETAIL,
        componentProps: {
          nftId: collectionDisplayNft.id,
        },
      });
    } else {
      // Multiple items in connection, display a grid
      push({
        title: collection.name,
        componentId: NAV_COMPONENT_NFT_COLLECTION,
        componentProps: {
          id: collection.id,
        },
      });
    }
  };

  return (
    <GridCard
      onClick={onClick}
      nft={collectionDisplayNft}
      subtitle={{ name: collection.name, length: collection.items.length }}
    />
  );
}

const getItemForIndex = (
  index: number,
  blockchainCollections: BlockchainCollections,
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
    const items = collection[1];
    const isCollapsed = collapsedCollections[i];
    const numberOfRowsInCollection = isCollapsed
      ? -1
      : Math.ceil(items.length / itemsPerRow);

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
  const collectionItems = collection[1];
  const numberOfRowsInCollection = Math.ceil(
    collectionItems.length / itemsPerRow
  );
  const wrappedCollectionGroupIndex = index - result;
  const collectionGroupIndex = wrappedCollectionGroupIndex - 1; // remove header;

  if (wrappedCollectionGroupIndex === 0) {
    return {
      height: isCollapsed ? 48 : 36,
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

  return {
    height: 174,
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
  collections: BlockchainCollections,
  collapsedCollections: CollapsedCollections,
  itemsPerRow: number,
  prependItems: Row[]
) => {
  const count = prependItems.length;
  return collections.reduce((count, collection, i) => {
    const items = collection[1];
    const numberOfRowsInCollection = Math.ceil(items.length / itemsPerRow);

    if (numberOfRowsInCollection == 0) {
      return count;
    }
    if (collapsedCollections[i]) {
      return count + 1; // 1 element to render collapsed collection
    }
    return count + numberOfRowsInCollection + 2;
  }, count);
};
