import { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { getSvgPath } from "figma-squircle";
import { Grid, Button, Typography } from "@mui/material";
import { styles, useCustomTheme, HOVER_OPACITY } from "@coral-xyz/themes";
import { Block as BlockIcon } from "@mui/icons-material";
import {
  useAppIcons,
  useBackgroundClient,
  useEnabledBlockchains,
  useNavigation,
} from "@coral-xyz/recoil";
import {
  Blockchain,
  UI_RPC_METHOD_NAVIGATION_CURRENT_URL_UPDATE,
} from "@coral-xyz/common";
import { WithDrawer } from "../../common/Layout/Drawer";
import { PluginApp } from "./Plugin";
import { EmptyState } from "../../common/EmptyState";
import { ProxyImage } from "../../common/ProxyImage";

const ICON_WIDTH = 64;

const squircleIconPath = getSvgPath({
  width: ICON_WIDTH,
  height: ICON_WIDTH,
  cornerRadius: 15,
  cornerSmoothing: 0.8,
});

const useStyles = styles((theme) => ({
  pluginIconRoot: {
    minWidth: ICON_WIDTH,
    marginLeft: "auto",
    marginRight: "auto",
  },
  pluginIconButton: {
    width: ICON_WIDTH,
    height: ICON_WIDTH,
    overflow: "hidden",
    clipPath: `path('${squircleIconPath}')`,
    padding: 0,
    backgroundColor: theme.custom.colors.nav,
    "&:hover": {
      opacity: HOVER_OPACITY,
    },
  },
  pluginTitle: {
    fontWeight: 500,
    color: theme.custom.colors.fontColor,
    fontSize: "12px",
    lineHeight: "16px",
    textAlign: "center",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
}));

export function Apps() {
  const enabledBlockchains = useEnabledBlockchains();
  const theme = useCustomTheme();

  if (!enabledBlockchains.includes(Blockchain.SOLANA)) {
    return (
      <EmptyState
        icon={(props: any) => <BlockIcon {...props} />}
        title={"Solana is disabled"}
        subtitle={"Enable Solana in blockchain settings to use apps"}
      />
    );
  }

  return (
    <div
      style={{
        paddingLeft: "12px",
        paddingRight: "12px",
        paddingBottom: "12px",
      }}
    >
      <div
        style={{
          paddingTop: "18px",
          paddingBottom: "18px",
          paddingLeft: "10px",
          paddingRight: "10px",
          background: theme.custom.colors.nav,
          border: `${theme.custom.colors.borderFull}`,
          borderRadius: "10px",
        }}
      >
        <PluginGrid />
      </div>
    </div>
  );
}

function PluginGrid() {
  const plugins = useAppIcons();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const background = useBackgroundClient();

  const onClickPlugin = (p: any) => {
    // Update the URL to use the plugin.
    //
    // This will do two things
    //
    // 1. Update and persist the new url. Important so that if the user
    //    closes/re-opens the app, the plugin opens up immediately.
    // 2. Cause a reload of this route with the plguin url in the search
    //    params, which will trigger the drawer to activate.
    //
    const newUrl = `${location.pathname}${
      location.search
    }&plugin=${encodeURIComponent(p.install.account.xnft.toString())}`;
    background
      .request({
        method: UI_RPC_METHOD_NAVIGATION_CURRENT_URL_UPDATE,
        params: [newUrl],
      })
      .catch(console.error);
  };

  return (
    <Grid container style={{}}>
      {plugins
        // HACK: hide autoinstalled ONE xnft -> entrypoint in collectibles.
        .filter(
          (p) =>
            p.install.account.xnft.toString() !==
            "4ekUZj2TKNoyCwnRDstvViCZYkhnhNoWNQpa5bBLwhq4"
        )
        .map((p: any, idx: number) => {
          return (
            <Grid
              item
              key={p.url}
              xs={3}
              style={{
                marginTop: idx >= 4 ? "24px" : 0,
              }}
            >
              <PluginIcon plugin={p} onClick={() => onClickPlugin(p)} />
            </Grid>
          );
        })}
    </Grid>
  );
}

function PluginIcon({ plugin, onClick }: any) {
  return (
    <AppIcon title={plugin.title} iconUrl={plugin.iconUrl} onClick={onClick} />
  );
}

function AppIcon({
  title,
  iconUrl,
  onClick,
}: {
  title: string;
  iconUrl: string;
  onClick: () => void;
}) {
  const classes = useStyles();
  return (
    <div
      style={{
        width: "72px",
        height: "88px",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <Button
        variant="contained"
        disableElevation
        className={classes.pluginIconButton}
        onClick={() => onClick()}
        classes={{
          root: classes.pluginIconRoot,
        }}
      >
        <ProxyImage
          src={iconUrl}
          style={{
            width: ICON_WIDTH,
            height: ICON_WIDTH,
          }}
        />
      </Button>
      <Typography className={classes.pluginTitle}>{title}</Typography>
    </div>
  );
}
