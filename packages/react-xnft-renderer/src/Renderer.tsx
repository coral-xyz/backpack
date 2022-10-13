import { useEffect, useRef } from "react";
import type { Plugin } from "./plugin";

export function PluginRenderer({ plugin }: { plugin: Plugin }) {
  const ref = useRef<any>();
  useEffect(() => {
    if (plugin && ref && ref.current) {
      plugin.mount();
      ref.current.appendChild(plugin.iframeRoot);
      return () => {
        ref.current.removeChild(plugin.iframeRoot!);
        plugin.unmount();
      };
    }
    return () => {};
  }, [plugin, ref]);
  return <div ref={ref}></div>;
}
