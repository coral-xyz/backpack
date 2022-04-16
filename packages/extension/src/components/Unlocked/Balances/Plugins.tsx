import { useEffect, useState } from "react";
import { useTheme, makeStyles, Typography } from "@material-ui/core";
import { NodeSerialized } from "@200ms/anchor-ui";
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
        <ViewRenderer viewId={0} />
      </div>
    </PluginProvider>
  );
}

function ViewRenderer({ initViewData, viewId }: any) {
  const { plugin } = usePluginContext();

  //
  // Force rerender the view whenever the plugin asks for it.
  //
  const [viewData, setViewData] = useState<NodeSerialized | undefined>(
    initViewData
  );

  //
  // Reload state on props change.
  //
  useEffect(() => {
    setViewData(initViewData);
  }, [initViewData]);

  //
  // Rerender whenever the plugin asks for it.
  //
  useEffect(() => {
    plugin.onRender(viewId, (newViewData: NodeSerialized) => {
      setViewData(newViewData);
    });
  }, [plugin, setViewData, viewId]);

  //
  // The view hasn't rendered yet.
  //
  if (!viewData) {
    return <></>;
  }

  const { id, props, style, children, kind } = viewData;
  switch (kind) {
    //    case "Div":
    //      return <DivView props={props} style={style} children={children} />;
    case "Text":
      return <TypographyView props={props} style={style} />;
    case "Table":
      return <></>; // todo
    //    case "Image":
    //      return <ImageView props={props} style={style} />;
    default:
      console.error(viewData);
      throw new Error("unexpected view data");
  }
}

function DivView({ props, style, children }: any) {
  return (
    <div style={style}>
      {children.map((c: NodeSerialized) => (
        <ViewRenderer key={c.id} initViewData={c} viewId={c.id} />
      ))}
    </div>
  );
}

function TypographyView({ props, style }: any) {
  const theme = useTheme() as any;
  style = {
    color: theme.custom.colors.fontColor,
    fontWeight: 500,
    ...style,
  };
  return <Typography style={style}>{props.text}</Typography>;
}

function ImageView({ props, style }: any) {
  return <img src={props.src} style={style} />;
}
