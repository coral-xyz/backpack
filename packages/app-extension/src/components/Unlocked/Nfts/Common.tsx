import { NAV_COMPONENT_NFT_DETAIL } from "@coral-xyz/common";
import { NAV_COMPONENT_NFT_CHAT } from "@coral-xyz/common/dist/esm/constants";
import { MessageBubbleUnreadIcon, ProxyImage } from "@coral-xyz/react-common";
import { useNavigation } from "@coral-xyz/recoil";
import { HOVER_OPACITY, styles, useCustomTheme } from "@coral-xyz/themes";
import CircleIcon from "@mui/icons-material/Circle";
import { Button, Typography } from "@mui/material";

import { MessageIcon } from "../../common/Icon";
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

  if (!nft) {
    return null;
  }
  return (
    <>
      {showNotificationBubble && (
        <CircleIcon
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            zIndex: 100,
            color: "#E33E3F",
          }}
        />
      )}
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
        }}
      >
        <ProxyImage
          style={{
            width: "100%",
          }}
          loadingStyles={{
            height: "100%",
          }}
          removeOnError={true}
          src={nft.imageUrl}
        />
        {metadataCollectionId && (
          <div
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
          </div>
        )}
        {subtitle && (
          <div
            style={{
              backgroundColor: theme.custom.colors.nav,
              position: "absolute",
              left: 0,
              bottom: 8,
              zIndex: 2,
              height: "24px",
              borderRadius: "12px",
              padding: "0 8px",
              margin: "0 5%",
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              maxWidth: "90%",
            }}
          >
            <Typography
              component="div"
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12px",
                color: theme.custom.colors.fontColor,
              }}
            >
              <div
                style={{
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                {subtitle.name}
              </div>
              <span
                style={{
                  marginLeft: "8px",
                  color: theme.custom.colors.secondary,
                }}
              >
                {subtitle.length}
              </span>
            </Typography>
          </div>
        )}
      </Button>
    </>
  );
}
