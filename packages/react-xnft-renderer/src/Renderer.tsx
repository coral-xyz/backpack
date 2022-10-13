import { useEffect, useRef } from "react";
import type { Plugin } from "./plugin";

export function PluginRenderer({
  plugin,
  metadata,
}: {
  plugin: Plugin;
  metadata: any;
}) {
  const ref = useRef<any>();

  useEffect(() => {
    if (plugin && ref && ref.current) {
      plugin.mount(metadata);
      ref.current.appendChild(plugin.iframeRoot);
      return () => {
        plugin.unmount();
      };
    }
    return () => {};
  }, [plugin, ref]);

  return <div ref={ref}></div>;
}
