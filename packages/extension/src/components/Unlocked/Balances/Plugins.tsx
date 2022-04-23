import { useTheme, makeStyles, Button } from "@material-ui/core";
import { Plugin, PluginRenderer } from "@200ms/anchor-ui-renderer";
import { usePlugins } from "../../../hooks/usePlugins";
import { useNavigation } from "../../../hooks/useNavigation";
import { NAV_COMPONENT_PLUGINS } from "../../../common";

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
}));

export function PluginGrid() {
  const plugins = usePlugins();
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        marginLeft: "12px",
        marginRight: "12px",
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

export function Plugins({ pluginUrl }: { pluginUrl: string }) {
  const plugins = usePlugins();
  const p = plugins.find((p) => p.iframeUrl === pluginUrl);
  if (p === undefined) {
    throw new Error("unable to find plugin");
  }
  return <PluginRenderer key={p.iframeUrl} plugin={p} />;
}

function PluginIcon({ plugin }: { plugin: Plugin }) {
  const classes = useStyles();
  const theme = useTheme() as any;
  const { push } = useNavigation();
  const onClick = () => {
    push({
      title: plugin.title,
      componentId: NAV_COMPONENT_PLUGINS,
      componentProps: { pluginUrl: plugin.iframeUrl },
    });
  };
  return (
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
  );
}
