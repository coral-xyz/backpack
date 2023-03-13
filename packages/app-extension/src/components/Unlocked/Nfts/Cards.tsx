import type { MouseEvent } from "react";
import { useState } from "react";
import type { Nft, NftCollection } from "@coral-xyz/common";
import {
  NAV_COMPONENT_NFT_COLLECTION,
  NAV_COMPONENT_NFT_DETAIL,
  UNKNOWN_NFT_ICON_SRC,
} from "@coral-xyz/common";
import {
  AppsColorIcon,
  MessageBubbleIcon,
  ProxyImage,
} from "@coral-xyz/react-common";
import {
  chatByCollectionId,
  chatByNftId,
  collectibleXnft,
  nftsByIds,
  useActiveWallet,
  useBlockchainConnectionUrl,
  useNavigation,
  useOpenPlugin,
} from "@coral-xyz/recoil";
import { HOVER_OPACITY, styles, useCustomTheme } from "@coral-xyz/themes";
import { Button, CircularProgress, Typography } from "@mui/material";
import { useRecoilValue, useRecoilValueLoadable } from "recoil";

import { useOpenChat } from "./Detail";

const useStyles = styles((theme) => ({
  button: {
    "&:hover": {
      opacity: HOVER_OPACITY,
    },
  },
}));

export function NFTCard({
  nft,
  subtitle,
  showCollectionChat,
}: {
  nft: Nft;
  subtitle?: {
    length: number;
    name: string;
  };
  showCollectionChat?: boolean;
}) {
  const activeWallet = useActiveWallet();
  const connectionUrl = useBlockchainConnectionUrl(activeWallet.blockchain);
  const classes = useStyles();
  const theme = useCustomTheme();
  const { push } = useNavigation();
  const openPlugin = useOpenPlugin();
  const whitelistedNftChat = useRecoilValue(
    chatByNftId({
      publicKey: activeWallet.publicKey,
      nftId: nft.id,
      connectionUrl,
    })
  );
  const whitelistedCollectionChat = useRecoilValue(
    chatByCollectionId(nft.metadataCollectionId)
  );
  const openChat = useOpenChat();
  const [joiningChat, setJoiningChat] = useState(false);

  const { contents, state } = useRecoilValueLoadable(
    collectibleXnft(
      nft ? { collection: nft.metadataCollectionId, mint: nft.mint } : null
    )
  );

  if (!nft) {
    return null;
  }

  const chat =
    whitelistedNftChat ?? showCollectionChat ? whitelistedCollectionChat : null;

  const xnft = (state === "hasValue" && contents) || null;

  const onOpenXnft = (e: MouseEvent) => {
    e.stopPropagation();
    if (xnft) {
      openPlugin(xnft + "/" + nft.mint);
    }
  };

  const openDetails = () => {
    push({
      title: nft.name,
      componentId: NAV_COMPONENT_NFT_DETAIL,
      componentProps: {
        nftId: nft.id,
        publicKey: activeWallet.publicKey,
        connectionUrl,
      },
    });
  };

  return (
    <div>
      <Button
        className={classes.button}
        onClick={xnft ? onOpenXnft : openDetails}
        disableRipple
        style={{
          textTransform: "none",
          padding: 0,
          borderRadius: "8px",
          position: "relative",
          overflow: "hidden",
          minWidth: "153.5px",
          minHeight: "153.5px",
          height: "100%",
          width: "100%",
          aspectRatio: "1",
          display: "flex",
          flexDirection: "column",
          background: theme.custom.colors.background,
        }}
      >
        <ProxyImage
          className="nftImage"
          style={{
            width: "100%",
          }}
          loadingStyles={{
            height: "100%",
          }}
          removeOnError
          src={nft.imageUrl}
          onError={(e) => {
            e.currentTarget.src = UNKNOWN_NFT_ICON_SRC;
          }}
        />
        <div
          style={{
            width: "100%",
            position: "absolute",
            left: 0,
            bottom: 8,
            zIndex: 2,
            display: "flex",
            justifyContent: "flex-start",
            padding: "0 5px",
            gap: "6px",
          }}
        >
          {xnft ? (
            <div
              className="xnftIcon"
              style={{
                background: theme.custom.colors.nav,
                display: "flex",
                alignItems: "center",
                borderRadius: "50%",
                padding: "5px",
              }}
            >
              <AppsColorIcon
                style={{
                  width: "16px",
                  height: "16px",
                }}
              />
            </div>
          ) : null}
        </div>
      </Button>
      <div
        style={{
          padding: "0px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Typography
          onClick={openDetails}
          component="div"
          style={{
            display: "flex",
            justifyContent: "flex-start",
            fontSize: "14px",
            color: theme.custom.colors.fontColor,
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            cursor: "pointer",
            padding: "8px 8px 8px 0px",
            flexGrow: 1,
          }}
        >
          <div
            style={{
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {subtitle?.name ?? nft.name}
          </div>
          {subtitle?.length ?? 0 > 1 ? (
            <span
              style={{
                marginLeft: "8px",
                color: theme.custom.colors.secondary,
              }}
            >
              {subtitle?.length ?? ""}
            </span>
          ) : null}
        </Typography>
        {chat && nft.mint ? (
          <div
            style={{
              height: "24px",
              width: "24px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={async (e: any) => {
              setJoiningChat(true);
              await openChat(chat, nft.mint!);
              setJoiningChat(false);
              e.stopPropagation();
            }}
          >
            {joiningChat ? (
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
        ) : null}
      </div>
    </div>
  );
}

export function CollectionCard({ collection }: { collection: NftCollection }) {
  const activeWallet = useActiveWallet();
  const connectionUrl = useBlockchainConnectionUrl(activeWallet.blockchain);
  const classes = useStyles();
  const { push } = useNavigation();
  const whitelistedChatCollection = useRecoilValue(
    chatByCollectionId(collection.metadataCollectionId)
  );
  const theme = useCustomTheme();
  const openChat = useOpenChat();
  const [joiningChat, setJoiningChat] = useState(false);
  const collectionDisplayNftIds: {
    publicKey: string;
    nftId: string;
  }[] = collection.itemIds.map((nftId) => ({
    publicKey: activeWallet.publicKey,
    nftId,
  }));

  collectionDisplayNftIds.length = Math.min(collectionDisplayNftIds.length, 4);

  const collectionDisplayNfts = useRecoilValue(
    nftsByIds({
      nftIds: collectionDisplayNftIds,
      blockchain: activeWallet.blockchain,
    })
  );

  const paddedCollectionDisplayNfts = [
    ...collectionDisplayNfts,
    null,
    null,
    null,
    null,
  ];
  paddedCollectionDisplayNfts.length = 4;

  if (!collectionDisplayNfts) {
    return null;
  }

  const nft = collectionDisplayNfts[0];

  const openCollection = () => {
    push({
      title: nft.collectionName,
      componentId: NAV_COMPONENT_NFT_COLLECTION,
      componentProps: {
        id: collection.id,
        publicKey: activeWallet.publicKey,
        connectionUrl,
      },
    });
  };

  return (
    <div>
      <Button
        className={classes.button}
        onClick={openCollection}
        disableRipple
        style={{
          textTransform: "none",
          padding: "4px",
          borderRadius: "8px",
          position: "relative",
          overflow: "hidden",
          minWidth: "153.5px",
          minHeight: "153.5px",
          height: "100%",
          width: "100%",
          aspectRatio: "1",
          display: "flex",
          flexDirection: "column",
          background: theme.custom.colors.background,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            height: "100%",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          {paddedCollectionDisplayNfts.map((nft, i) => {
            return (
              <div
                key={nft?.id ?? i}
                style={{
                  position: "relative",
                  width: "50%",
                  height: "50%",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "3px",
                    right: "3px",
                    bottom: "3px",
                    left: "3px",
                    overflow: "hidden",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                    }}
                  >
                    {nft ? (
                      <ProxyImage
                        style={{
                          width: "100%",
                          height: "120%",
                        }}
                        loadingStyles={{
                          height: "120%",
                        }}
                        removeOnError
                        src={nft.imageUrl}
                        onError={(e) => {
                          e.currentTarget.src = UNKNOWN_NFT_ICON_SRC;
                        }}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            width: "100%",
            position: "absolute",
            left: 0,
            bottom: 8,
            zIndex: 2,
            display: "flex",
            justifyContent: "space-between",
            padding: "0 5px",
            gap: "6px",
          }}
        >
          {/* {xnft ? (
            <div
              style={{
                background: theme.custom.colors.nav,
                display: "flex",
                alignItems: "center",
                borderRadius: "15px",
                padding: "4px",
              }}
            >
              <RocketLaunchIcon
                sx={{
                  fontSize: "16px",
                  color: theme.custom.colors.fontColor,
                }}
              />
            </div>
          ) : null} */}
        </div>
      </Button>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Typography
          onClick={openCollection}
          component="div"
          style={{
            display: "flex",
            justifyContent: "flex-start",
            fontSize: "14px",
            color: theme.custom.colors.fontColor,
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            cursor: "pointer",
            padding: "8px 8px 8px 0px",
            flexGrow: 1,
          }}
        >
          <div
            style={{
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {nft.collectionName}
          </div>
          {collection.itemIds.length > 0 ? (
            <span
              style={{
                marginLeft: "8px",
                color: theme.custom.colors.secondary,
              }}
            >
              {collection.itemIds.length}
            </span>
          ) : null}
        </Typography>
        {whitelistedChatCollection ? (
          <div
            style={{
              height: "24px",
              width: "24px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={async (e: any) => {
              setJoiningChat(true);
              await openChat(whitelistedChatCollection, nft.mint!);
              setJoiningChat(false);
              e.stopPropagation();
            }}
          >
            {joiningChat ? (
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
        ) : null}
      </div>
    </div>
  );
}
