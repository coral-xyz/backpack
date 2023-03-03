import React, { useEffect, useState } from "react";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { useBreakpoints } from "@coral-xyz/react-common";
import { useCustomTheme } from "@coral-xyz/themes";
import CallMadeIcon from "@mui/icons-material/CallMade";

import { CheckMark } from "./barter/CheckMark";
import { RemoteNftWithSuspense } from "./barter/SwapPage";

export const NftStickerRender = ({
  mint,
  uuid,
}: {
  mint: string;
  uuid: string;
}) => {
  const { isXs } = useBreakpoints();
  const theme = useCustomTheme();
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
          background: theme.custom.colors.invertedBg4,
          borderRadius: 8,
          width: getDimensions(),
          border: `1px solid ${theme.custom.colors.icon}`,
          marginBottom: 10,
        }}
      >
        <RemoteNftWithSuspense mint={mint} />
        <div
          style={{
            cursor: "pointer",
            color: theme.custom.colors.icon,
            display: "flex",
            justifyContent: "center",
          }}
          onClick={() => {
            window.open(`https://magiceden.io/item-details/${mint}`, "_blank");
          }}
        >
          <div style={{ display: "flex", marginBottom: 5 }}>
            <div>View on magiceden</div>{" "}
            <CallMadeIcon style={{ fontSize: 18 }} />
          </div>
        </div>
        {ownerVerified ? <div style={{ position: "absolute", right: 10, top: 8 }}>
          {" "}
          <CheckMark />{" "}
        </div> : null}
      </div>
    </div>
  );
};
