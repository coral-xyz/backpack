import { useEffect, useState } from "react";
import {
  useTheme,
  makeStyles,
  Typography,
  Grid,
  Button,
} from "@material-ui/core";
import { Element, TextSerialized, NodeSerialized } from "@200ms/anchor-ui";
import { usePluginContext, usePlugins } from "../../../hooks/usePlugins";
import { useNavigation } from "../../../hooks/useNavigation";
import { PluginProvider } from "../../../context/Plugin";
import { Plugin } from "./Plugin";
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

function PluginRenderer({ plugin }: any) {
  const classes = useStyles();
  return (
    <PluginProvider plugin={plugin}>
      <RootRenderer />
    </PluginProvider>
  );
}

function RootRenderer() {
  const { plugin } = usePluginContext();
  const [children, setChildren] = useState<Array<Element>>([]);

  //
  // Wait for the initial render. Should be called exactly once per plugin.
  //
  useEffect(() => {
    //
    // Create the iframe plugin.
    //
    plugin.create();

    //
    // Register the root renderer.
    //
    plugin.onRenderRoot((c: Array<Element>) => {
      setChildren([...c]);
    });

    //
    // Remove the iframe and cleanup all state on shut down.
    //
    return () => {
      plugin.destroy();
    };
  }, [plugin]);

  return (
    <>
      {children.map((e) => (
        <ViewRenderer key={e.id} element={e} />
      ))}
    </>
  );
}

function ViewRenderer({ element }: { element: Element }) {
  const { plugin } = usePluginContext();

  //
  // Force rerender the view whenever the plugin asks for it.
  //
  const [viewData, setViewData] = useState<Element>(element);

  //
  // Reload state on props change.
  //
  useEffect(() => {
    setViewData(element);
  }, [element]);

  //
  // Rerender the component when needed.
  //
  useEffect(() => {
    plugin.onRender(viewData.id, (newViewData: Element) => {
      setViewData({
        ...newViewData,
      });
    });
  }, [plugin, setViewData]);

  const { props, style, kind } = viewData;
  switch (kind) {
    case "View":
      return <View props={props} style={style} children={viewData.children} />;
    case "Text":
      return <Text props={props} style={style} children={viewData.children} />;
    case "Table":
      return <Table props={props} style={style} />;
    case "Image":
      return <Image props={props} style={style} children={viewData.children} />;
    case "raw":
      return <Raw text={viewData.text} />;
    default:
      console.error(viewData);
      throw new Error("unexpected view data");
  }
}

function View({ props, style, children }: any) {
  return (
    <div style={style}>
      {children.map((c: Element) => (
        <ViewRenderer key={c.id} element={c} />
      ))}
    </div>
  );
}

function Table({ props, style, children }: any) {
  return <></>;
}

function Text({ props, children, style }: any) {
  const theme = useTheme() as any;
  style = {
    color: theme.custom.colors.fontColor,
    fontWeight: 500,
    ...style,
  };
  return (
    <Typography style={style}>
      {children.map((c: Element) => (
        <ViewRenderer key={c.id} element={c} />
      ))}
    </Typography>
  );
}

function Image({ props, style }: any) {
  return <img src={props.src} style={style} />;
}

function Raw({ text }: any) {
  return <>{text}</>;
}
