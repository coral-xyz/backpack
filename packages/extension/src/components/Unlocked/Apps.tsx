import { Button, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Plugin, PluginRenderer } from "@200ms/anchor-ui-renderer";
import { usePlugins, useTablePlugins, useNavigation } from "@200ms/recoil";
import { NAV_COMPONENT_PLUGINS } from "@200ms/common";

const ICON_WIDTH = "60px";

const useStyles = makeStyles((theme: any) => ({
  pluginIconRoot: {
    minWidth: "40px",
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
    fontSize: "10px",
    textAlign: "center",
    marginTop: "4px",
  },
}));

export function Apps() {
  return <PluginGrid />;
}

function PluginGrid() {
  const plugins = usePlugins();
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        marginLeft: "12px",
        marginRight: "12px",
        marginTop: "16px",
        marginBottom: "16px",
      }}
    >
      {plugins.map((p: Plugin, idx: number) => {
        return (
          <div
            key={p.iframeUrl}
            style={{
              marginRight: idx !== plugins.length - 1 ? "12px" : 0,
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
    <div>
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
            borderRadius: "10px",
            width: ICON_WIDTH,
            height: ICON_WIDTH,
          }}
        />
      </Button>
      <Typography className={classes.pluginTitle}>{plugin.title}</Typography>
    </div>
  );
}

export function PluginDisplay({ pluginUrl }: { pluginUrl: string }) {
  const plugins = usePlugins();
  const p = plugins.find((p) => p.iframeUrl === pluginUrl);
  if (p === undefined) {
    throw new Error("unable to find plugin");
  }
  return <PluginRenderer key={p.iframeUrl} plugin={p} />;
}

export function PluginTableDetailDisplay({ pluginUrl }: { pluginUrl: string }) {
  const plugins = useTablePlugins();
  const p = plugins.find((p) => p.iframeUrl === pluginUrl);
  if (p === undefined) {
    throw new Error("unable to find plugin");
  }
  return <PluginRenderer key={p.iframeUrl} plugin={p} />;
}
