import { useEffect } from "react";
import { Typography } from "@mui/material";
import { useCustomTheme } from "@coral-xyz/themes";
import { useXnfts } from "@coral-xyz/recoil";
import { SettingsList } from "../../../common/Settings/List";
import { PushDetail } from "../../../common";
import { useNavStack } from "../../../common/Layout/NavStack";

export function XnftSettings() {
  const nav = useNavStack();
  const theme = useCustomTheme();
  const xnfts = useXnfts();
  const settingsMenu = {} as any;
  xnfts.forEach((xnft) => {
    settingsMenu[xnft.title] = {
      label: xnft.title,
      onClick: () => {}, // todo
      icon: (props: any) => (
        <img style={{ width: "44px", height: "44px" }} src={xnft.iconUrl} />
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

  return (
    <div
      style={{
        marginTop: "16px",
      }}
    >
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
    </div>
  );
}
