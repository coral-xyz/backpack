import { useEffect, useRef, useState } from "react";
import type { Plugin } from "../../../common/src/plugin";
import { Loading } from "../components/common";

export function PluginRenderer({
  plugin,
  metadata,
}: {
  plugin: Plugin;
  metadata: any;
}) {
  const ref = useRef<any>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (plugin && ref && ref.current) {
      plugin.mount(metadata);
      plugin.didFinishSetup!.then(() => {
        setLoaded(true);
      });
      ref.current.appendChild(plugin.iframeRoot);
      return () => {
        plugin.unmount();
      };
    }
    return () => {};
  }, [plugin, ref]);

  return <div ref={ref}>{!loaded && <Loading />}</div>;
}
