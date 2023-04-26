import { Blockchain } from "@coral-xyz/common";
import {
  blockchainBalancesSorted,
  useActiveSolanaWallet,
  useLoader,
} from "@coral-xyz/recoil";

export const useSearchedTokens = (searchFilter: string) => {
  const activeSolWallet = useActiveSolanaWallet();

  const [tokenAccounts, , isLoading] = useLoader(
    blockchainBalancesSorted({
      publicKey: activeSolWallet?.publicKey,
      blockchain: Blockchain.SOLANA,
    }),
    [],
    [activeSolWallet]
  );

  if (isLoading) {
    //TODO: adda skeletons here
    return [];
  }

  return tokenAccounts
    .filter(
      (x) => x && x.name?.toLowerCase().includes(searchFilter.toLowerCase())
    )
    .map((x) => ({
      name: x.name || "",
      id: x.mint || "",
      image: x.logo || "",
      address: x.address || "",
    }));
};
