import { Suspense, useRef, useState } from "react";
import Autosizer from "react-virtualized-auto-sizer";
import { VariableSizeList } from "react-window";
import type { NftCollection } from "@coral-xyz/common";
import { Loading, MessageBubbleIcon } from "@coral-xyz/react-common";
import {
  chatByCollectionId,
  nftById,
  nftCollectionsWithIds,
} from "@coral-xyz/recoil";
import type { CustomTheme } from "@coral-xyz/themes";
import { styled, useCustomTheme } from "@coral-xyz/themes";
import { CircularProgress, Grid, Typography } from "@mui/material";
import type { UnwrapRecoilValue } from "recoil";
import { useRecoilValueLoadable } from "recoil";

import { Scrollbar } from "../../common/Layout/Scrollbar";

import { useOpenChat } from "./NftDetail";
import { NFTCard } from "./NftEntry";
import { LoadingRow } from "./NftTable";

export function NftsCollection({
  publicKey,
  connectionUrl,
  id,
}: {
  publicKey: string;
  connectionUrl: string;
  id: string;
}) {
  return (
    <div
      style={{
        height: "100%",
      }}
    >
      <_Grid id={id} publicKey={publicKey} connectionUrl={connectionUrl} />
    </div>
  );
}

function _Grid({
  id,
  publicKey,
  connectionUrl,
}: {
  id: string;
  publicKey: string;
  connectionUrl: string;
}) {
  //  const theme = useCustomTheme();
  //  const openChat = useOpenChat();
  //  const [joiningChat, setJoiningChat] = useState(false);
  const { contents, state } = useRecoilValueLoadable<
    UnwrapRecoilValue<typeof nftCollectionsWithIds>
  >(nftCollectionsWithIds);
  const c = (state === "hasValue" && contents) || null;
  const collection = !c
    ? null
    : c
        .map((c: any) => c.collections!)
        .flat()
        .find((c: any) => c.id === id);

  /*
  const whitelistedCollectionChat = useRecoilValueLoadable(
    chatByCollectionId(collection?.metadataCollectionId)
  );
*/

  //  const chat = whitelistedCollectionChat.contents;

  // Hack: id can be undefined due to framer-motion animation, and
  // collection can be undefined when looking at a collection not in current
  // wallet.
  if (id === undefined) {
    return null;
  }

  /*
  const countText =
    chat?.memberCount >= 1000
      ? `${(chat?.memberCount / 1000).toFixed(1)}k`
      : chat?.memberCount ?? "0";
*/
  return (
    <>
      {/*
      {chat ? (
        <Typography
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            fontSize: "14px",
            padding: "8px 8px 16px 8px",
            color: theme.custom.colors.fontColor,
          }}
          onClick={async (e: any) => {
            setJoiningChat(true);
            await openChat(chat, collection.itemIds[0]);
            setJoiningChat(false);
            e.stopPropagation();
          }}
        >
          <div
            style={{
              height: "24px",
              width: "24px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {joiningChat ? (
              // eslint-disable-next-line react/jsx-no-undef
              <CircularProgress
                sx={{
                  color: theme.custom.colors.fontColor,
                  height: "13px",
                  width: "13px",
                }}
                size="small"
                thickness={3}
              />
            ) : (
              <MessageBubbleIcon
                sx={{
                  width: "18px",
                  color: theme.custom.colors.fontColor,
                  "&:hover": {
                    color: `${theme.custom.colors.fontColor3} !important`,
                  },
                }}
              />
            )}
          </div>
          <div
            style={{
              padding: "0px 8px",
              opacity: 0.8,
            }}
          >
            {`${chat.name} ⸱ ${countText} members`}
          </div>
          <div
            style={{
              fontWeight: "bold",
            }}
          >
            Join
          </div>
        </Typography>
      ) : null}
			*/}
      <CollectionTable
        publicKey={publicKey}
        connectionUrl={connectionUrl}
        collection={collection}
      />
    </>
  );
}

function CollectionTable({
  collection,
  publicKey,
  connectionUrl,
}: {
  collection: NftCollection | null;
  publicKey: string;
  connectionUrl: string;
}) {
  const nftWidth = 174;
  const ref = useRef<VariableSizeList>(null);
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
                numberOfItemsPerRow,
                collection,
              })}
              ref={ref}
              itemKey={(i) => {
                const row = getRowForIndex(
                  i,
                  numberOfItemsPerRow,
                  collection,
                  publicKey,
                  connectionUrl
                );
                return row.key;
              }}
              outerElementType={Scrollbar}
              height={height}
              width={width}
              itemCount={getNumberOfRows(numberOfItemsPerRow, collection)}
              itemSize={(i) => {
                const row = getRowForIndex(
                  i,
                  numberOfItemsPerRow,
                  collection,
                  publicKey,
                  connectionUrl
                );
                return row.height;
              }}
              style={{ overflow: "hidden" }}
            >
              {({ index, style }) => {
                const row = getRowForIndex(
                  index,
                  numberOfItemsPerRow,
                  collection,
                  publicKey,
                  connectionUrl
                );
                return <div style={style}>{row.component}</div>;
              }}
            </VariableSizeList>
          </div>
        );
      }}
    </Autosizer>
  );
}

const getNumberOfRows = (
  itemsPerRow: number,
  collection: NftCollection | null
) => {
  if (!collection) {
    // Plus two for header and footer.
    return 1 + 2;
  }
  const numberOfRowsInCollection = Math.ceil(
    collection.itemIds.length / itemsPerRow
  );
  // Plus two for header and footer.
  return numberOfRowsInCollection + 2;
};

const getRowForIndex = (
  index: number,
  itemsPerRow: number,
  collection: NftCollection | null,
  publicKey: string,
  connectionUrl: string
): Row => {
  const numberRows = getNumberOfRows(itemsPerRow, collection);
  if (index === 0) {
    return {
      height: 12,
      key: `header${index}`,
      component: <HeaderRow />,
    };
  }
  if (index === numberRows - 1) {
    return {
      height: 24,
      key: `footer${index}`,
      component: <FooterRow />,
    };
  }
  if (!collection) {
    return {
      height: 165.5 + 26,
      key: `loading${index}`,
      component: <LoadingRow itemsPerRow={itemsPerRow} />,
    };
  }
  return {
    height: 165.5 + 26,
    key: `items${index}`,
    component: (
      <ItemRow
        itemStartIndex={index}
        itemsPerRow={itemsPerRow}
        collection={collection}
        publicKey={publicKey}
        connectionUrl={connectionUrl}
      />
    ),
  };
};

function NftCard({
  publicKey,
  connectionUrl,
  nftId,
}: {
  publicKey: string;
  connectionUrl: string;
  nftId: string;
}) {
  const { contents, state } = useRecoilValueLoadable(
    nftById({
      publicKey,
      connectionUrl,
      nftId,
    })
  );
  const nft = (state === "hasValue" && contents) || null;
  if (!nft) {
    return null;
  }
  return <NFTCard nft={nft} />;
}

const ItemRow = function ({
  itemStartIndex,
  itemsPerRow,
  collection,
  publicKey,
  connectionUrl,
}: {
  itemStartIndex: number;
  itemsPerRow: number;
  collection: NftCollection;
  publicKey: string;
  connectionUrl: string;
}) {
  // Minus one because we need to chop off the header.
  const start = (itemStartIndex - 1) * itemsPerRow;
  const end = start + itemsPerRow;
  const items = new Array(itemsPerRow).fill(null);
  const collectionItems = collection.itemIds.slice(start, end);
  collectionItems.forEach((item, k) => {
    items[k] = item;
  });

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
        {items.map((nftId: string | null) => {
          return (
            <div
              key={nftId}
              style={{
                position: "relative",
                width: "153.5px",
                height: `${153.5 + 26}px`,
                overflow: "hidden",
                margin: "0px 6px",
              }}
            >
              {nftId !== null && collection ? (
                <Suspense fallback={<Loading />}>
                  <NftCard
                    publicKey={publicKey}
                    connectionUrl={connectionUrl}
                    nftId={nftId}
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

const HeaderRow = function () {
  return <CustomCard top bottom={false} />;
};

const FooterRow = function () {
  return <CustomCard top={false} bottom />;
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

type Row = {
  height: number;
  key: string;
  component: JSX.Element;
};
