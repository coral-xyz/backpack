import { useState } from "react";
import { MessageBubbleIcon } from "@coral-xyz/react-common";
import {
  chatByCollectionId,
  nftById,
  nftCollectionsWithIds,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { CircularProgress, Grid, Typography } from "@mui/material";
import type { UnwrapRecoilValue } from "recoil";
import { useRecoilValueLoadable } from "recoil";

import { NFTCard } from "./Cards";
import { useOpenChat } from "./Detail";

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
        paddingLeft: "16px",
        paddingRight: "16px",
      }}
    >
      <_Grid publicKey={publicKey} connectionUrl={connectionUrl} id={id} />
    </div>
  );
}

function _Grid({
  publicKey,
  connectionUrl,
  id,
}: {
  publicKey: string;
  connectionUrl: string;
  id: string;
}) {
  const theme = useCustomTheme();
  const openChat = useOpenChat();
  const [joiningChat, setJoiningChat] = useState(false);
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

  const whitelistedCollectionChat = useRecoilValueLoadable(
    chatByCollectionId(collection?.metadataCollectionId)
  );

  const chat = whitelistedCollectionChat.contents;

  // Hack: id can be undefined due to framer-motion animation, and
  // collection can be undefined when looking at a collection not in current
  // wallet.
  if (id === undefined || !collection) {
    return null;
  }

  const countText =
    chat?.memberCount >= 1000
      ? `${(chat?.memberCount / 1000).toFixed(1)}k`
      : chat?.memberCount ?? "0";

  return (
    <>
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
      <Grid container spacing={{ xs: 2, ms: 2, md: 2, lg: 2 }}>
        {collection.itemIds.map((nftId: string) => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={nftId}>
            <NftCard
              publicKey={publicKey}
              connectionUrl={connectionUrl}
              nftId={nftId}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
}

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
