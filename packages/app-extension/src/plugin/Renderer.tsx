import { useEffect, useRef, useState } from "react";
import { Loading } from "../components/common";
import { useAvatarUrl, useDarkMode, useUsername } from "@coral-xyz/recoil";

export function PluginRenderer({ plugin }: { plugin: any }) {
  const ref = useRef<any>();
  const [loaded, setLoaded] = useState(false);
  const username = useUsername();
  const isDarkMode = useDarkMode();
  const avatarUrl = useAvatarUrl(100);

  useEffect(() => {
    if (plugin && ref && ref.current) {
      plugin.mount();
      plugin.didFinishSetup!.then(() => {
        plugin.pushAppUiMetadata({ isDarkMode, username, avatarUrl });
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

  useEffect(() => {
    plugin.pushAppUiMetadata({ isDarkMode, username, avatarUrl });
  }, [username, isDarkMode, avatarUrl]);

  return (
    <div ref={ref} style={{ height: "100vh", overflow: "hidden" }}>
      {!loaded && (
        <div style={{ height: "100vh" }}>
          {" "}
          <Loading />{" "}
        </div>
      )}
    </div>
  );
}
