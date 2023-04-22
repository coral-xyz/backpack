import safeToString from "@coral-xyz/app-extension/src/utils/safeToString";
import {
  useActiveSolanaWallet,
  useSolanaConnectionUrl,
  xnfts,
} from "@coral-xyz/recoil";
import { useRecoilValueLoadable } from "recoil";

export const useSearchedXnfts = (searchFilter: string) => {
  const activeSolWallet = useActiveSolanaWallet();
  const connectionUrl = useSolanaConnectionUrl();
  const { contents, state }: any = useRecoilValueLoadable(
    xnfts({
      publicKey: activeSolWallet?.publicKey,
      connectionUrl,
    })
  );

  if (state === "loading" || state === "hasError") {
    return [];
  }
  return contents
    .filter((x: any) =>
      x.title?.toLowerCase()?.includes(searchFilter.toLowerCase())
    )
    .map((x: any) => ({
      name: x.title || "",
      image: x.iconUrl || "",
      id: x.id || "",
      publicKey: safeToString(x.install.account.xnft),
    }));
};
