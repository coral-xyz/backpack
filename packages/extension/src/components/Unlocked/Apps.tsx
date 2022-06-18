import { Button, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Plugin, PluginRenderer } from "@coral-xyz/anchor-ui-renderer";
import { usePlugins, useTablePlugins, useNavigation } from "@coral-xyz/recoil";
import type { SearchParamsFor } from "@coral-xyz/recoil";
import { NAV_COMPONENT_PLUGINS } from "@coral-xyz/common";
import { useRootNav } from "../common/hooks";

const ICON_WIDTH = "64px";

const useStyles = makeStyles((theme: any) => ({
  pluginIconRoot: {
    minWidth: "64px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  pluginIconButton: {
    width: ICON_WIDTH,
    height: ICON_WIDTH,
    borderRadius: "10px",
    backgroundColor: theme.custom.colors.nav,
    padding: 0,
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
  useRootNav();
  return <PluginGrid />;
}

function PluginGrid() {
  const plugins = usePlugins();
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        marginLeft: "20px",
        marginRight: "20px",
        marginBottom: "24px",
        justifyContent: "space-between",
      }}
    >
      {plugins.map((p: Plugin, idx: number) => {
        return (
          <div
            key={p.iframeUrl}
            style={{
              //              marginRight: idx !== plugins.length - 1 ? "15.67px" : 0,
              marginTop: idx >= 4 ? "24px" : 0,
            }}
          >
            <PluginIcon plugin={p} />
          </div>
        );
      })}
    </div>
  );
}

function PluginIcon({ plugin }: { plugin: Plugin }) {
  const classes = useStyles();
  const { push } = useNavigation();
  const onClick = () => {
    push({
      title: plugin.title,
      componentId: NAV_COMPONENT_PLUGINS,
      componentProps: { pluginUrl: plugin.iframeUrl },
    });
  };
  return (
    <div
      style={{
        width: "72px",
        height: "88px",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
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
          src={plugin.iconUrl}
          style={{
            borderRadius: "8px",
            width: ICON_WIDTH,
            height: ICON_WIDTH,
          }}
        />
      </Button>
      <Typography className={classes.pluginTitle}>{plugin.title}</Typography>
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
