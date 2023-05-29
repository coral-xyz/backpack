import React, { useEffect, useState } from "react";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { useBreakpoints } from "@coral-xyz/react-common";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import CheckIcon from "@mui/icons-material/Check";

import { openWindow } from "../utils/open";

import { RemoteNftWithSuspense } from "./barter/SwapPage";
import { useChatContext } from "./ChatContext";

export const useStyles = styles((theme) => ({
  hoverParent: {
    "&:hover $hoverChild, & .Mui-focused $hoverChild": {
      visibility: "visible",
    },
  },
  hoverChild: {
    visibility: "hidden",
  },
}));

export const NftStickerRender = ({
  mint,
  uuid,
  displayName,
}: {
  mint: string;
  uuid: string;
  displayName: string;
}) => {
  const classes = useStyles();
  const { isXs } = useBreakpoints();
  const theme = useCustomTheme();
  const { remoteUsername } = useChatContext();
  const [ownerVerified, setOwnerVerified] = useState(false);
  const getDimensions = () => {
    if (isXs) {
      return 180;
    }
    return 250;
  };

  const validate = async (uuid, mint) => {
    try {
      const res = await fetch(
        `${BACKEND_API_URL}/nft/validateOwner?ownerUuid=${uuid}&mint=${mint}`,
        {
          method: "GET",
        }
      );
      const json = await res.json();
      if (json.isOwner) {
        setOwnerVerified(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    validate(uuid, mint);
  }, [uuid, mint]);

  return (
    <div>
      <div
        style={{
          position: "relative",
          width: getDimensions(),
          marginBottom: 10,
          cursor: "pointer",
        }}
        className={classes.hoverParent}
      >
        <RemoteNftWithSuspense
          dimension={getDimensions()}
          onClick={() => {
            openWindow(`https://magiceden.io/item-details/${mint}`, "_blank");
          }}
          mint={mint}
          rounded
        />
        {ownerVerified ? (
          <div
            style={{
              position: "absolute",
              top: -44,
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
            className={classes.hoverChild}
          >
            <div
              style={{
                padding: "8px 11px",
                background: theme.custom.colors.invertedPrimary,
                color: theme.custom.colors.bg3,
                display: "inline-flex",
                borderRadius: 5,
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <CheckIcon style={{ color: "#11A800", marginRight: 10 }} />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <div style={{ fontWeight: 500, fontSize: 13 }}>
                  {" "}
                  @{displayName} owns this NFT{" "}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
