import { useActiveSolanaWallet } from "@coral-xyz/recoil";
import { useEffect, useState } from "react";

const isLiveCheck = fetch("https://xnft.wao.gg/api/isLive")
  .then((r) => r.json())
  .catch(() => ({ isLive: false }));

const whitelist = [
  "4m39tDyZcK9dgqYaBaX7PiTp1kjAKrMhNYmxDcVu3hNp",
  "46YogwAHj4Yi4gZ4Rkyta1dRqKKcKZJy7YC5iJJHDvnw",
  "GqRzxLfxUmuQPh48K3cq7M6uy8bScJV9qVmXcfbmT5jD",
  "2CqD4M1kJb3rHB5ZM25NVQibdJ6v6cryi7GHDaXhac46",
  "34UpQDG2R66u5XL9BFwNhsdzT6sqzat1Js9Yd7PmEXG2",
  "8HNkdh4KDmQcP7f7kNsSFLjDRp2vEYPLBdhHeD7U9q2S",
  "DcpYXJsWBgkV6kck4a7cWBg6B4epPeFRCMZJjxudGKh4",
];

export function useIsONELive() {
  const [isLive, setIsLive] = useState<boolean | "loading">("loading");
  const wallet = useActiveSolanaWallet();

  useEffect(() => {
    isLiveCheck.then((response) => {
      setIsLive(response.isLive);
    });
  }, []);

  return wallet && (isLive || whitelist.includes(wallet?.publicKey));
}
