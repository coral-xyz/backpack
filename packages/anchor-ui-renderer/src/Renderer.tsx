import { useEffect, useState } from "react";
import { Element } from "@200ms/anchor-ui";
import { PluginProvider, usePluginContext } from "./Context";
import { ViewRenderer } from "./ViewRenderer";

export function PluginRenderer({ plugin }: any) {
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
