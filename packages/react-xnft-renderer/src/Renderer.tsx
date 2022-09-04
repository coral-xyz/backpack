import { useEffect, useState } from "react";
import { Element } from "react-xnft";
import { PluginProvider, usePluginContext } from "./Context";
import { ViewRenderer } from "./ViewRenderer";
import type { Plugin } from "./plugin";

export function PluginRenderer({ plugin }: { plugin: Plugin }) {
  useEffect(() => {
    plugin.mount();
    return () => {
      plugin.unmount();
    };
  }, [plugin]);
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
  // Rerender when needed.
  //
  useEffect(() => {
    plugin.onRenderRoot((c: Array<Element>) => {
      setChildren([...c]);
    });
  }, [plugin, setChildren]);

  return (
    <>
      {children.map((e) => (
        <ViewRenderer key={e.id} element={e} />
      ))}
    </>
  );
}
