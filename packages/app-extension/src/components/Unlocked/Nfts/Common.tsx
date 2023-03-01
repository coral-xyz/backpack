import type { MouseEvent } from "react";
import {
  NAV_COMPONENT_NFT_CHAT,
  UNKNOWN_NFT_ICON_SRC,
} from "@coral-xyz/common";
import { MessageBubbleUnreadIcon, ProxyImage } from "@coral-xyz/react-common";
import {
  collectibleXnft,
  useNavigation,
  useOpenPlugin,
} from "@coral-xyz/recoil";
import { HOVER_OPACITY, styles, useCustomTheme } from "@coral-xyz/themes";
import CircleIcon from "@mui/icons-material/Circle";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import { Button, IconButton, Typography } from "@mui/material";
import { useRecoilValueLoadable } from "recoil";

const useStyles = styles(() => ({
  button: {
    "&:hover": {
      opacity: HOVER_OPACITY,
    },
  },
}));

export function GridCard({
  onClick,
  nft,
  subtitle,
  metadataCollectionId,
  showNotificationBubble,
}: any) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const { push } = useNavigation();
  const openPlugin = useOpenPlugin();

  const { contents, state } = useRecoilValueLoadable(
    collectibleXnft(
      nft ? { collection: nft.metadataCollectionId, mint: nft.mint } : null
    )
  );

  const xnft = (state === "hasValue" && contents) || null;

  const onClickAction = (e: MouseEvent) => {
    e.stopPropagation();
    if (xnft) {
      openPlugin(xnft + "/" + nft.mint);
    }
  };

  if (!nft) {
    return null;
  }

  return (
    <Button
      className={classes.button}
      onClick={onClick}
      disableRipple
      style={{
          textTransform: "none",
          padding: 0,
          borderRadius: "8px",
          position: "relative",
          overflow: "hidden",
          minWidth: "153.5px",
          minHeight: "153.5px",
          aspectRatio: "1",
          background: theme.custom.colors.background,
        }}
      >
      <ProxyImage
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
      {metadataCollectionId ? <div
        style={{
              backgroundColor: theme.custom.colors.nav,
              position: "absolute",
              right: 0,
              top: 8,
              zIndex: 2,
              width: 40,
              height: 40,
              borderRadius: "50%",
              padding: "0 8px",
              margin: "0 5%",
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              maxWidth: "90%",
            }}
          >
        <MessageBubbleUnreadIcon
          onClick={(e: any) => {
                push({
                  title: subtitle.name || "",
                  componentId: NAV_COMPONENT_NFT_CHAT,
                  componentProps: {
                    collectionId: metadataCollectionId,
                    nftMint: nft.mint,
                    title: subtitle.name || "",
                  },
                });
                e.stopPropagation();
              }}
            />
      </div> : null}

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
        <div
          style={{
              backgroundColor: theme.custom.colors.nav,
              height: "24px",
              borderRadius: "12px",
              padding: "0 8px",
              display: "flex",
              alignItems: "center",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
          <Typography
            component="div"
            style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12px",
                color: theme.custom.colors.fontColor,
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
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
            {subtitle?.length > 0 ? <span
              style={{
                    marginLeft: "8px",
                    color: theme.custom.colors.secondary,
                  }}
                >
              {subtitle?.length ?? ""}
            </span> : null}
          </Typography>
        </div>
        {xnft ? <IconButton
          disableRipple
          onClick={onClickAction}
          sx={{
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
                  color: theme.custom.colors.icon,
                }}
              />
        </IconButton> : null}
      </div>
    </Button>
  );
}
