import { useEffect, useRef, useState } from "react";
import type { Plugin, XnftPreference } from "@coral-xyz/common";
import { Loading } from "@coral-xyz/react-common";
import {
  useAvatarUrl,
  useDarkMode,
  useUser,
  useXnftJwt,
} from "@coral-xyz/recoil";

export function PluginRenderer({
  plugin,
  xnftPreference,
  deepXnftPath,
}: {
  plugin: Plugin;
  xnftPreference: XnftPreference | null;
  deepXnftPath: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const { username } = useUser();
  const isDarkMode = useDarkMode();
  const avatarUrl = useAvatarUrl(100);
  const jwt = useXnftJwt(plugin.xnftAddress.toString());
  useEffect(() => {
    if (plugin && ref && ref.current) {
      plugin.mount(xnftPreference, deepXnftPath);
      plugin.didFinishSetup!.then(() => {
        plugin.pushAppUiMetadata({ isDarkMode, username, avatarUrl, jwt });
        plugin.iframeRoot!.style.display = "";
        setLoaded(true);
      });
      plugin.iframeRoot!.style.display = "none";
      ref.current.appendChild(plugin.iframeRoot!);
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
          <Loading />
        </div>
      )}
    </div>
  );
}
