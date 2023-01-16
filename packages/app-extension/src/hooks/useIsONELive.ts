import { useEffect, useState } from "react";
import { useActiveSolanaWallet } from "@coral-xyz/recoil";

const isLiveCheck = fetch("https://xnft.wao.gg/api/isLive")
  .then((r) => r.json())
  .catch(() => ({ isLive: false }));

export function useIsONELive() {
  const [isLive, setIsLive] = useState<boolean | "loading">("loading");
  const wallet = useActiveSolanaWallet();

  useEffect(() => {
    isLiveCheck.then((response) => {
      setIsLive(response.isLive);
    });
  }, []);

  return wallet && isLive;
}
