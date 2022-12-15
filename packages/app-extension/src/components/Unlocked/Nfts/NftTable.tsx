import React, { AllHTMLAttributes, useRef, useState } from "react";
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
  component: JSX.Element;
};

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
                height,
                numberOfItemsPerRow,
                collapsedCollections,
              })}
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
                  setCollapsedCollections,
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
                  setCollapsedCollections,
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

const HeaderRow = React.memo(function ({
  blockchainIndex,
  blockchainCollections,
  collapsedCollections,
  setCollapsedCollections,
}: {
  blockchainIndex: number;
  blockchainCollections: BlockchainCollections;
  collapsedCollections: CollapsedCollections;
  setCollapsedCollections: (c: CollapsedCollections) => void;
}) {
  const [blockchain] = blockchainCollections[blockchainIndex];
  const isCollapsed = collapsedCollections[blockchainIndex];
  return (
    <>
      <Card top={true} bottom={isCollapsed}>
        <BlockchainHeader
          setShowContent={(isCollapsed) => {
            const collapsed = [...collapsedCollections];
            collapsed[blockchainIndex] = !isCollapsed;
            setCollapsedCollections(collapsed);
          }}
          showContent={!collapsedCollections[blockchainIndex]}
          blockchain={blockchain as Blockchain}
        />
      </Card>
    </>
  );
});
const FooterRow = React.memo(function () {
  return <Card top={false} bottom={true} />;
});
const ItemRow = React.memo(function ({
  items,
  numberOfItemsPerRow,
}: {
  items: NftCollection[];
  numberOfItemsPerRow: number;
}) {
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
});

const Card = styled("div")(
  ({ theme }) =>
    ({ top, bottom }: { top: boolean; bottom: boolean }) => ({
      position: "relative",
      backgroundColor: "inherit",
      marginLeft: "12px",
      marginRight: "12px",
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
  setCollapsedCollections: (updated: CollapsedCollections) => void,
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
      height: isCollapsed ? 52 : 40,
      component: (
        <HeaderRow
          blockchainIndex={blockchainIndex}
          blockchainCollections={blockchainCollections}
          collapsedCollections={collapsedCollections}
          setCollapsedCollections={setCollapsedCollections}
        />
      ),
    };
  }
  if (collectionGroupIndex >= numberOfRowsInCollection) {
    return {
      height: 24,
      component: <FooterRow />,
    };
  }
  const startIndex = collectionGroupIndex * itemsPerRow;
  const numberOfItems =
    startIndex + itemsPerRow <= collectionItems.length
      ? itemsPerRow
      : collectionItems.length % itemsPerRow;

  const items: NftCollection[] = new Array(itemsPerRow).fill(null);
  for (let i = startIndex; i < startIndex + numberOfItems; i++) {
    items[i - startIndex] = collectionItems[i];
  }
  return {
    height: 174,
    component: (
      <ItemRow items={items} numberOfItemsPerRow={numberOfRowsInCollection} />
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
    if (collapsedCollections[i]) {
      count += 1; // 1 element to render collapsed collection
    } else {
      count += numberOfRowsInCollection + 2;
    }
    return count;
  }, count);
};
