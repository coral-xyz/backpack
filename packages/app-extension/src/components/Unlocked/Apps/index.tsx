import { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { getSvgPath } from "figma-squircle";
import { Grid, Button, Typography } from "@mui/material";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import {
  useBackgroundClient,
  useAppIcons,
  useNavigation,
} from "@coral-xyz/recoil";
import { UI_RPC_METHOD_NAVIGATION_CURRENT_URL_UPDATE } from "@coral-xyz/common";
import { WithDrawer } from "../../common/Layout/Drawer";
import { PluginApp } from "./Plugin";

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
  const theme = useCustomTheme();
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
  const { push } = useNavigation();
  const plugins = useAppIcons();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const background = useBackgroundClient();
  const xnftAddress = searchParams.get("plugin");
  const [openDrawer, setOpenDrawer] = useState(
    xnftAddress !== undefined && xnftAddress !== null
  );

  useEffect(() => {
    setOpenDrawer(xnftAddress !== undefined && xnftAddress !== null);
  }, [xnftAddress]);

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

  const closePlugin = () => {
    setOpenDrawer(false);

    // Bit of a hack. Would be better to have a callback on the drawer animation closing.
    // Also, there's a potential race condition between this request persisting
    // and the user navigating to another url before that completing. In practice,
    // it's not a problem because this happens so quickly relative to the next
    // user action. If there's a bug, investigate this. :)
    setTimeout(() => {
      searchParams.delete("plugin");
      const newUrl = `${location.pathname}?${searchParams.toString()}`;
      background
        .request({
          method: UI_RPC_METHOD_NAVIGATION_CURRENT_URL_UPDATE,
          params: [newUrl],
        })
        .catch(console.error);
    }, 100);
  };

  return (
    <>
      <Grid container style={{}}>
        {plugins.map((p: any, idx: number) => {
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
      <WithDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
        {xnftAddress && (
          <PluginApp xnftAddress={xnftAddress} closePlugin={closePlugin} />
        )}
      </WithDrawer>
    </>
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
        <img
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
