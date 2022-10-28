import { useEffect, useState } from "react";

const isLiveCheck = fetch("https://xnft.wao.gg/api/isLive")
  .then((r) => r.json())
  .catch(() => ({ isLive: false }));

export function useIsONELive(): [boolean, boolean] {
  const [[isLive, isLoading], setIsLive] = useState([false, true]);
  useEffect(() => {
    isLiveCheck.then((response) => {
      //      setIsLive([response.isLive, false]);
    });
  }, []);

  return [isLive, isLoading];
}
