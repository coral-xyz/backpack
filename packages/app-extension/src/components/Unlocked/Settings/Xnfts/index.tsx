import { useEffect } from "react";
import { Typography } from "@mui/material";
import { Apps } from "@mui/icons-material";
import { useCustomTheme } from "@coral-xyz/themes";
import { useAppIcons } from "@coral-xyz/recoil";
import { SettingsList } from "../../../common/Settings/List";
import { PushDetail } from "../../../common";
import { useNavStack } from "../../../common/Layout/NavStack";
import { EmptyState } from "../../../common/EmptyState";

export function XnftSettings() {
  const nav = useNavStack();
  const theme = useCustomTheme();
  const xnfts = useAppIcons();
  const settingsMenu = {} as any;
  xnfts.forEach((xnft) => {
    settingsMenu[xnft.install.publicKey.toString()] = {
      label: xnft.title,
      onClick: () => nav.push("xnfts-detail", { xnft }),
      icon: (props: any) => (
        <img
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
    nav.setStyle({
      borderBottom: `solid 1pt ${theme.custom.colors.border}`,
    });
    nav.setContentStyle({
      backgroundColor: theme.custom.colors.background,
    });
    nav.setTitle("xNFTs");
  }, [nav.setContentStyle, theme]);

  return xnfts.length === 0 ? (
    <EmptyState
      icon={(props: any) => <Apps {...props} />}
      title={"No xNFTs"}
      subtitle={"Get started by adding your first xNFT"}
      contentStyle={{
        marginBottom: "64px", // Tab height offset.
      }}
      buttonText={"Browse the xNFT Library"}
      onClick={() => window.open("https://xnft.gg")}
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
