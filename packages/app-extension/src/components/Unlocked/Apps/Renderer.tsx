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
  xnftPreference as xnftPreferenceAtom,
} from "@coral-xyz/recoil";
import { useRecoilValue } from "recoil";

const buildNumber = BACKPACK_FEATURE_FORCE_LATEST_VERSION
  ? parseInt(BACKPACK_CONFIG_GITHUB_RUN_NUMBER)
  : -1;

export function PluginRenderer({
  plugin,
  deepXnftPath,
}: {
  plugin: Plugin;
  deepXnftPath: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const { username, uuid } = useUser();
  const isDarkMode = useDarkMode();
  const avatarUrl = useAvatarUrl(100);
  const xnftPreference = useRecoilValue(
    xnftPreferenceAtom(plugin?.xnftInstallAddress?.toString())
  );
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

  const sizes = ["lg", "md", "sm"];
  const splashUrls = plugin.splashUrls ?? {};
  const size = sizes.find((size) => splashUrls[size]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        overflow: "hidden",
        top: "0px",
        left: "0px",
        bottom: "0px",
        right: "0px",
        backgroundImage: size ? `url(${splashUrls[size]})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        pointerEvents: "none",
      }}
    ></div>
  );
}
