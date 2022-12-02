import { useEffect, useRef, useState } from "react";
import type { XnftPreference } from "@coral-xyz/common";
import {
  useAvatarUrl,
  useDarkMode,
  useUser,
  useXnftPreference,
} from "@coral-xyz/recoil";

import { Loading } from "../components/common";

export function PluginRenderer({
  plugin,
  xnftPreference,
}: {
  plugin: any;
  xnftPreference: XnftPreference;
}) {
  const ref = useRef<any>();
  const [loaded, setLoaded] = useState(false);
  const { username } = useUser();
  const isDarkMode = useDarkMode();
  const avatarUrl = useAvatarUrl(100);

  useEffect(() => {
    if (plugin && ref && ref.current) {
      plugin.mount(xnftPreference);
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
