import { useEffect, useState } from "react";
import { Element } from "@200ms/anchor-ui";
import { PluginProvider, usePluginContext } from "./Context";

export function PluginRenderer({ plugin }: any) {
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
  style = {
    color: "#fff", // todo: inject theme into top level renderer and set provider?
    fontWeight: 500,
    ...style,
  };
  return (
    <p style={style}>
      {children.map((c: Element) => (
        <ViewRenderer key={c.id} element={c} />
      ))}
    </p>
  );
}

function Image({ props, style }: any) {
  return <img src={props.src} style={style} />;
}

function Raw({ text }: any) {
  return <>{text}</>;
}
