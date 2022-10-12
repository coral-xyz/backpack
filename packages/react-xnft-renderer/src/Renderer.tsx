import { useEffect } from "react";
import type { Plugin } from "./plugin";

export function PluginRenderer({ plugin }: { plugin: Plugin }) {
  useEffect(() => {
    plugin.mount();
    return () => {
      plugin.unmount();
    };
  }, [plugin]);
  return <></>;
}
