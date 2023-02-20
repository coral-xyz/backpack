// TODO(shared)
import { useEffect, useState } from "react";

const isLiveCheck = fetch("https://xnft.wao.gg/api/isLive")
  .then((r) => r.json())
  .catch(() => ({ isLive: false }));

let isLiveCache: boolean | "loading" = "loading";

export function useIsONELive() {
  const [isLive, setIsLive] = useState<boolean | "loading">(isLiveCache);

  useEffect(() => {
    if (isLive !== true) {
      isLiveCheck.then((response) => {
        isLiveCache = response.isLive;
        setIsLive(response.isLive);
      });
    }
  }, []);

  return isLive;
}
