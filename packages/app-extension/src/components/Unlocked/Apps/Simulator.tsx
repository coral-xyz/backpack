import { useEffect, useState } from "react";
import type { Plugin } from "@coral-xyz/common";
import { SIMULATOR_URL } from "@coral-xyz/recoil";

import { PluginDisplay } from "./Plugin";

const removeTimestamps = /[0-9]{13}/g;

// The refresh code is a big hack. :)
export function Simulator({
  plugin,
  deepXnftPath,
}: {
  plugin: Plugin;
  deepXnftPath: string;
}) {
  const refresh = useJavaScriptRefresh(SIMULATOR_URL);
  return (
    <PluginDisplay key={refresh} plugin={plugin} deepXnftPath={deepXnftPath} />
  );
}

function useJavaScriptRefresh(url: string): number {
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let previous: any = null;
    const i = setInterval(() => {
      (async () => {
        const js = await (await fetch(url)).text();
        const noTSjs = js?.replaceAll(removeTimestamps, ""); // remove cachebusting timestamps next.js
        if (previous !== null && previous !== noTSjs) {
          setRefresh((r) => r + 1);
        }
        previous = noTSjs;
      })();
    }, 1000);
    return () => clearInterval(i);
  }, []);

  return refresh;
}
