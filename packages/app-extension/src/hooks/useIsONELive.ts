import { useEffect, useState } from "react";

const isLiveCheck = fetch("https://xnft.wao.gg/api/isLive")
  .then((r) => r.json())
  .catch(() => ({ isLive: false }));

export function useIsONELive() {
  const [isLive, setIsLive] = useState<boolean | "loading">("loading");
  useEffect(() => {
    isLiveCheck.then((response) => {
      setIsLive(response.isLive);
    });
  }, []);

  return isLive;
}
