import { useEffect, useState } from "react";
import { useActiveSolanaWallet } from "@coral-xyz/recoil";

export function useIsONELive() {
  const [isLive, setIsLive] = useState<boolean | "loading">("loading");
  const wallet = useActiveSolanaWallet();
  useEffect(() => {
    fetch("https://one.xnfts.dev/api/isLive")
      .then((r) => r.json())
      .catch(() => ({ isLive: false }))
      .then((response) => {
        setIsLive(response.isLive);
      });
  }, []);

  return wallet && isLive;
}
