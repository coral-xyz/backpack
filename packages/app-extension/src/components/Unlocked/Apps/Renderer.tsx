import { useEffect, useRef, useState } from "react";
import type { Plugin, XnftPreference } from "@coral-xyz/common";
import {
  BACKPACK_CONFIG_GITHUB_RUN_NUMBER,
  BACKPACK_FEATURE_FORCE_LATEST_VERSION,
} from "@coral-xyz/common";
import { Loading } from "@coral-xyz/react-common";
import {
  useAvatarUrl,
  useDarkMode,
  useUser,
  useXnftJwt,
} from "@coral-xyz/recoil";

const buildNumber = BACKPACK_FEATURE_FORCE_LATEST_VERSION
  ? parseInt(BACKPACK_CONFIG_GITHUB_RUN_NUMBER)
  : -1;

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
  const { username, uuid } = useUser();
  const isDarkMode = useDarkMode();
  const avatarUrl = useAvatarUrl(100);
  const jwt = useXnftJwt(plugin.xnftAddress.toString());
  useEffect(() => {
    if (plugin && ref && ref.current) {
      plugin.mount(xnftPreference, deepXnftPath);
      plugin.didFinishSetup!.then(() => {
        plugin.pushAppUiMetadata({
          isDarkMode,
          username,
          userId: uuid,
          avatarUrl,
          jwt,
          version: buildNumber,
        });
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
    plugin.pushAppUiMetadata({
      isDarkMode,
      username,
      userId: uuid,
      avatarUrl,
      version: buildNumber,
    });
  }, [username, isDarkMode, avatarUrl]);

  return (
    <div ref={ref} style={{ height: "100vh", overflow: "hidden" }}>
      {!loaded && (
        <div style={{ height: "100vh" }}>
          <SplashScreen splashUrls={plugin.splashUrls ?? {}} /> :
        </div>
      )}
    </div>
  );
}

function SplashScreen({
  splashUrls,
}: {
  splashUrls: { [key: string]: string };
}) {
  const sizes = ["lg", "md", "sm"];

  const size = sizes.find((size) => splashUrls[size]);

  if (!size) {
    return <Loading />;
  }

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        backgroundImage: `url(${splashUrls[size]})`,
        backgroundPosition: "cover",
      }}
    />
  );
}
