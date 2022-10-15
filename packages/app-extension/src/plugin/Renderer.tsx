import { useEffect, useRef, useState } from "react";
import { Loading } from "../components/common";

export function PluginRenderer({
  plugin,
  metadata,
}: {
  plugin: any;
  metadata: any;
}) {
  const ref = useRef<any>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (plugin && ref && ref.current) {
      plugin.mount(metadata);
      plugin.didFinishSetup!.then(() => {
        plugin.iframeRoot.style.display = "";
        setLoaded(true);
      });
      plugin.iframeRoot.style.display = "none";
      ref.current.appendChild(plugin.iframeRoot);
      return () => {
        plugin.unmount();
      };
    }
    return () => {};
  }, [plugin, ref]);

  return (
    <div ref={ref}>
      {!loaded && (
        <div style={{ height: "100vh" }}>
          {" "}
          <Loading />{" "}
        </div>
      )}
    </div>
  );
}
