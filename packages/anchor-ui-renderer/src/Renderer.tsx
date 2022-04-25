import { useEffect, useState } from "react";
import { Element } from "@200ms/anchor-ui";
import { PluginProvider, usePluginContext } from "./Context";
import { ViewRenderer } from "./ViewRenderer";

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
