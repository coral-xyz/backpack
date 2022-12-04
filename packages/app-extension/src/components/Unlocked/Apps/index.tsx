import { useLocation } from "react-router-dom";
import {
  Blockchain,
  TAB_APPS,
  UI_RPC_METHOD_NAVIGATION_CURRENT_URL_UPDATE,
} from "@coral-xyz/common";
import {
  filteredPlugins,
  useActiveWallets,
  useBackgroundClient,
  useEnabledBlockchains,
  useLoader,
} from "@coral-xyz/recoil";
import { HOVER_OPACITY, styles, useCustomTheme } from "@coral-xyz/themes";
import { Block as BlockIcon } from "@mui/icons-material";
import { Button, Grid, Skeleton, Typography } from "@mui/material";
import { getSvgPath } from "figma-squircle";

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

  if (!enabledBlockchains.includes(Blockchain.SOLANA)) {
    return (
      <EmptyState
        icon={(props: any) => <BlockIcon {...props} />}
        title={"Solana is disabled"}
        subtitle={"Enable Solana in blockchain settings to use apps"}
      />
    );
  }

  return <PluginGrid />;
}

function PluginGrid() {
  const location = useLocation();
  const background = useBackgroundClient();
  const theme = useCustomTheme();
  const activeWallets = useActiveWallets();

  const [plugins, _, isLoading] = useLoader(
    filteredPlugins,
    [],
    // Note this reloads on any change to the active wallets, which reloads
    // NFTs for both blockchains.
    // TODO Make this reload for only the relevant blockchain
    [activeWallets]
  );

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
    }&pluginProps=${encodeURIComponent(
      JSON.stringify({ xnftAddress: p.install.account.xnft.toString() })
    )}`;
    background
      .request({
        method: UI_RPC_METHOD_NAVIGATION_CURRENT_URL_UPDATE,
        params: [newUrl, TAB_APPS],
      })
      .catch(console.error);
  };

  if (!isLoading && plugins.length === 0) {
    return (
      <EmptyState
        icon={(props: any) => <BlockIcon {...props} />}
        title={"No xNFTS"}
        subtitle={"Get started with your first xNFT"}
        buttonText={"Browse xNFTs"}
        onClick={() => window.open("https://xnft.gg")}
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
        <Grid container>
          {isLoading
            ? Array.from(Array(10).keys()).map((_, idx) => {
                return (
                  <Grid
                    item
                    key={idx}
                    xs={3}
                    style={{
                      marginTop: idx >= 4 ? "24px" : 0,
                    }}
                  >
                    <SkeletonAppIcon />
                  </Grid>
                );
              })
            : plugins.map((p: any, idx: number) => {
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
      </div>
    </div>
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

function SkeletonAppIcon() {
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
      <Skeleton
        height={ICON_WIDTH}
        width={ICON_WIDTH}
        sx={{
          transform: "none",
          clipPath: `path('${squircleIconPath}')`,
          marginLeft: "auto",
          marginRight: "auto",
          background: "rgba(0,0,0,0.15)",
        }}
      />
      <Skeleton
        height={12}
        width={48}
        sx={{
          transform: "none",
          marginLeft: "auto",
          marginRight: "auto",
          background: "rgba(0,0,0,0.15)",
        }}
      />
    </div>
  );
}
