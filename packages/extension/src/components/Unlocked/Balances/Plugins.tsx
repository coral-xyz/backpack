import { useEffect, useState } from "react";
import { useTheme, makeStyles, Typography } from "@material-ui/core";
import { Element, TextSerialized, NodeSerialized } from "@200ms/anchor-ui";
import { usePluginContext, usePlugins } from "../../../hooks/usePlugins";
import { PluginProvider } from "../../../context/Plugin";

const useStyles = makeStyles((theme: any) => ({
  pluginView: {
    marginBottom: "5px",
  },
}));

export function Plugins() {
  const plugins = usePlugins();
  return (
    <div>
      {plugins.map((p: any) => (
        <PluginRenderer key={p.iframeUrl} plugin={p} />
      ))}
    </div>
  );
}

function PluginRenderer({ plugin }: any) {
  const classes = useStyles();
  return (
    <PluginProvider plugin={plugin}>
      <div className={classes.pluginView}>
        <RootRenderer />
      </div>
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
      console.log("rendering", newViewData);
      setViewData({
        ...newViewData,
      });
    });
  }, [plugin, setViewData]);

  const { props, style, kind } = viewData;
  switch (kind) {
    case "View":
      return (
        <DivView props={props} style={style} children={viewData.children} />
      );
    case "Text":
      return (
        <TypographyView
          props={props}
          style={style}
          children={viewData.children}
        />
      );
    case "Table":
      return <></>; // todo
    case "Image":
      return <ImageView props={props} style={style} />;
    case "raw":
      return <RawView text={viewData.text} />;
    default:
      console.error(viewData);
      throw new Error("unexpected view data");
  }
}

function DivView({ props, style, children }: any) {
  return (
    <div style={style}>
      {children.map((c: Element) => (
        <ViewRenderer key={c.id} element={c} />
      ))}
    </div>
  );
}

function TypographyView({ props, children, style }: any) {
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

function ImageView({ props, style }: any) {
  return <img src={props.src} style={style} />;
}

function RawView({ text }: any) {
  return <>{text}</>;
}
