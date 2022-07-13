import { useState, useEffect } from "react";
import { PluginDisplay } from "./Plugin";

// The refresh code is a big hack. :)
export function Simulator({ pluginUrl }: { pluginUrl: string }) {
  const props = { pluginUrl };
  const refresh = useJavaScriptRefresh(props.pluginUrl);
  console.log("refreshing here", refresh);
  return refresh % 2 === 1 ? <div></div> : <PluginDisplay {...props} />;
}

function useJavaScriptRefresh(url: string): number {
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let previous: any = null;
    const i = setInterval(() => {
      (async () => {
        const js = await (await fetch(url)).text();
        if (previous !== null && previous !== js) {
          setRefresh((r) => r + 1);
        }
        previous = js;
      })();
    }, 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (refresh % 2 === 1) {
      setTimeout(() => {
        setRefresh((r) => r + 1);
      }, 100);
    }
  }, [refresh]);

  return refresh;
}
