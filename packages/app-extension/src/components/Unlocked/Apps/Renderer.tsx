import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Plugin } from "@coral-xyz/common";
import {
  BACKPACK_CONFIG_GITHUB_RUN_NUMBER,
  BACKPACK_FEATURE_FORCE_LATEST_VERSION,
} from "@coral-xyz/common";
import {
  useAvatarUrl,
  useDarkMode,
  useUser,
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
  const { username, uuid } = useUser();
  const [splash, setSplash] = useState<string | null>(null);
  const isDarkMode = useDarkMode();
  const avatarUrl = useAvatarUrl(100);
  const xnftPreference = useRecoilValue(
    xnftPreferenceAtom(plugin?.xnftInstallAddress?.toString())
  );
  useEffect(() => {
    if (plugin && ref && ref.current) {
      plugin.mount(xnftPreference, deepXnftPath);
      plugin.didFinishSetup!.then(() => {
        plugin.pushAppUiMetadata({
          isDarkMode,
          username,
          userId: uuid,
          avatarUrl,
          jwt: "", // Deprecated.
          version: buildNumber,
        });

        // timeout hides iframe loading flicker.
        setTimeout(() => {
          plugin.iframeRoot!.style.display = "";
        }, 200);
      });
      plugin.iframeRoot!.style.display = "none";
      ref.current.appendChild(plugin.iframeRoot!);
      return () => {
        plugin.unmount();
      };
    }
    return () => {};
  }, [plugin, ref]);

  useLayoutEffect(() => {
    const resizeHandler = () => {
      if (ref.current) {
        const width = ref.current.clientWidth;
        const height = ref.current.clientHeight;

        setSplash(selectSplash(plugin?.splashUrls, width, height));
      }
    };
    if (ref.current) {
      window.addEventListener("resize", resizeHandler);
      resizeHandler();
    }
    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, [ref.current]);
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
    <div
      ref={ref}
      style={{
        position: "absolute",
        overflow: "hidden",
        top: "0px",
        left: "0px",
        bottom: "0px",
        right: "0px",
        backgroundImage: splash ? `url(${splash})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center center",
      }}
    />
  );
}

function selectSplash(
  splashUrls: { src: string; height: number; width: number }[] | undefined,
  width: number,
  height: number
): string {
  if (!Array.isArray(splashUrls)) {
    splashUrls = [
      { src: "assets/defaultSplash600.svg", height: 600, width: 600 },
      { src: "assets/defaultSplash1000.svg", height: 1000, width: 1000 },
      { src: "assets/defaultSplash2000.svg", height: 2000, width: 2000 },
    ];
  }

  let bestFitHeight = 0;
  let bestFitWidth = 0;

  splashUrls.forEach((splash, i) => {
    const currentBestHeight = splashUrls![bestFitHeight].height;
    if (
      height <= splash.height &&
      (splash.height < currentBestHeight || height > currentBestHeight)
    ) {
      bestFitHeight = i;
    }

    const currentBestWidth = splashUrls![bestFitWidth].width;
    if (
      width <= splash.width &&
      (splash.width < currentBestWidth || width > currentBestWidth)
    ) {
      bestFitWidth = i;
    }
  });

  const heightSplash = splashUrls[bestFitHeight];
  const widthSplash = splashUrls[bestFitWidth];

  // if both are valid options -> return smaller one
  if (heightSplash.width > width && widthSplash.height > height) {
    if (
      heightSplash.height * heightSplash.width >
      widthSplash.height * widthSplash.width
    ) {
      return widthSplash.src;
    } else {
      return heightSplash.src;
    }
  }

  // only height valid
  if (heightSplash.width > width) {
    return heightSplash.src;
  }

  // only width valid
  if (widthSplash.height > height) {
    return widthSplash.src;
  }

  // if none are valid -> go for height.
  return heightSplash.src;
}
