import { useEffect } from "react";
import { XNFT_GG_LINK } from "@coral-xyz/common";
import { EmptyState, ProxyImage, PushDetail } from "@coral-xyz/react-common";
import { useActiveSolanaWallet, useAppIcons } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Apps } from "@mui/icons-material";
import { Typography } from "@mui/material";

import { useNavStack } from "../../../common/Layout/NavStack";
import { SettingsList } from "../../../common/Settings/List";

export function XnftSettings() {
  const nav = useNavStack();
  const theme = useCustomTheme();
  // TODO: Aggregate view.
  const { publicKey } = useActiveSolanaWallet();
  const xnfts = useAppIcons(publicKey);
  const settingsMenu = {} as any;
  xnfts.forEach((xnft) => {
    const pubkeyStr = xnft.install.publicKey.toString();
    settingsMenu[pubkeyStr] = {
      label: xnft.title,
      onClick: () => nav.push("xnfts-detail", { xnft }),
      icon: () => (
        <ProxyImage
          style={{
            marginRight: "12px",
            borderRadius: "8px",
            width: "44px",
            height: "44px",
          }}
          src={xnft.iconUrl}
        />
      ),
      detailIcon: <PushDetail />,
      style: {
        height: "68px",
      },
    };
  });

  useEffect(() => {
    nav.setTitle("xNFTs");
  }, [nav.setTitle]);

  return xnfts.length === 0 ? (
    <EmptyState
      icon={(props: any) => <Apps {...props} />}
      title={"No xNFTs"}
      subtitle={"Get started by adding your first xNFT"}
      contentStyle={{
        marginBottom: "64px", // Tab height offset.
      }}
      buttonText={"Browse the xNFT Library"}
      onClick={() => window.open(XNFT_GG_LINK, "_blank")}
    />
  ) : (
    <div
      style={{
        marginTop: "16px",
        marginBottom: "16px",
      }}
    >
      <>
        <Typography
          style={{
            fontSize: "16px",
            lineHeight: "24px",
            marginLeft: "16px",
            color: theme.custom.colors.fontColor,
          }}
        >
          Installed xNFTs
        </Typography>
        <SettingsList
          menuItems={settingsMenu}
          style={{
            marginTop: "12px",
          }}
        />
      </>
    </div>
  );
}
