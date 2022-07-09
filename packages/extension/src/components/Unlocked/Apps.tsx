import { Grid, Button, Typography } from "@mui/material";
import { styles } from "@coral-xyz/themes";
import { PluginRenderer } from "@coral-xyz/anchor-ui-renderer";
import {
  useAppIcons,
  usePlugins,
  useTablePlugins,
  useNavigation,
} from "@coral-xyz/recoil";
import type { SearchParamsFor } from "@coral-xyz/recoil";
import { NAV_COMPONENT_PLUGINS } from "@coral-xyz/common";
import { getSvgPath } from "figma-squircle";

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
  },
}));

export function Apps() {
  return <PluginGrid />;
}

function PluginGrid() {
  const plugins = useAppIcons();
  return (
    <Grid
      container
      style={{
        paddingLeft: "20px",
        paddingRight: "20px",
        marginBottom: "24px",
      }}
    >
      {plugins
        .concat(plugins)
        .concat(plugins)
        .map((p: any, idx: number) => {
          return (
            <Grid
              item
              key={p.iframeUrl}
              xs={3}
              style={{
                marginTop: idx >= 4 ? "24px" : 0,
              }}
            >
              <PluginIcon plugin={p} />
            </Grid>
          );
        })}
    </Grid>
  );
}

function PluginIcon({ plugin }: any) {
  const { push } = useNavigation();
  const onClick = () => {
    push({
      title: plugin.title,
      componentId: plugin.componentId
        ? plugin.componentId
        : NAV_COMPONENT_PLUGINS,
      componentProps: { pluginUrl: plugin.url },
    });
  };
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

export function PluginDisplay({ pluginUrl }: SearchParamsFor.Plugin["props"]) {
  const plugins = usePlugins();
  const p = plugins.find((p) => p.iframeUrl === encodeURI(pluginUrl));
  if (p === undefined) {
    throw new Error("unable to find plugin");
  }
  return <PluginRenderer key={p.iframeUrl} plugin={p} />;
}

export function PluginTableDetailDisplay({
  pluginUrl,
}: SearchParamsFor.Plugin["props"]) {
  const plugins = useTablePlugins();
  const p = plugins.find((p) => p.iframeUrl === encodeURI(pluginUrl));
  if (p === undefined) {
    throw new Error("unable to find plugin");
  }
  return <PluginRenderer key={p.iframeUrl} plugin={p} />;
}
