// This file is for cases where Suspense is acting up in React Native and we use useRecoilValueLoadable directly instead
import { Wallet } from "@@types/types";
import { Blockchain } from "@coral-xyz/common";
import {
  activeSolanaWallet,
  activeEthereumWallet,
  blockchainTokenData,
  totalBalance as totalBalanceSelector,
  blockchainTotalBalance,
  activeWallet,
  allWallets,
} from "@coral-xyz/recoil";
import { useRecoilValueLoadable } from "recoil";

type Response = {
  loading: boolean;
  error: boolean;
  data: any;
};

type RecoilData = {
  state: "hasValue" | "loading" | "hasError";
  contents: Promise<any> | any;
};

// the successor to wrapResponse
function handleResponse(data: RecoilData, fallback: any) {
  if (data.state === "loading") {
    return fallback;
  }

  if (data.state === "hasValue") {
    return data.contents;
  }

  if (data.state === "hasError") {
    return fallback;
  }
}

// First peter made this and it was fine
function wrapResponse(data: any, result = null): Response {
  return {
    loading: data.state === "loading",
    error: data.state === "hasError",
    data: data.state === "hasValue" ? data.contents : result,
  };
}

// TODO(peter): fix the conditional hook issue
export function useBlockchainActiveWallet(blockchain: Blockchain) {
  switch (blockchain) {
    case Blockchain.ETHEREUM: {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const data = useRecoilValueLoadable(activeEthereumWallet);
      return wrapResponse(data);
    }
    case Blockchain.SOLANA: {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const data = useRecoilValueLoadable(activeSolanaWallet);
      return wrapResponse(data);
    }
    default: {
      throw new Error(`invalid blockchain ${blockchain}`);
    }
  }
}

export function useBlockchainTokenData({
  publicKey,
  blockchain,
  tokenAddress,
}: {
  publicKey: string;
  blockchain: Blockchain;
  tokenAddress: string;
}) {
  const data = useRecoilValueLoadable(
    blockchainTokenData({
      publicKey,
      blockchain,
      tokenAddress,
    })
  );

  return wrapResponse(data);
}

export function useActiveEthereumWallet() {
  const data = useRecoilValueLoadable(activeEthereumWallet);
  return wrapResponse(data);
}

export function useTotalBalance() {
  const tb = useRecoilValueLoadable(totalBalanceSelector);

  const { totalBalance, totalChange, percentChange } =
    tb.state === "hasValue"
      ? tb.contents
      : {
          totalBalance: 0,
          totalChange: 0,
          percentChange: 0,
        };

  const isLoading = tb.state === "loading";
  return { totalBalance, totalChange, percentChange, isLoading };
}

export function useWalletBalance(wallet: Wallet) {
  const data = useRecoilValueLoadable(
    blockchainTotalBalance({
      publicKey: wallet.publicKey,
      blockchain: wallet.blockchain,
    })
  );

  return handleResponse(data, {
    percentChange: 0,
    totalBalance: 0,
    totalChange: 0,
  });
}

export function useActiveWallet(): Wallet | object {
  const data = useRecoilValueLoadable(activeWallet);
  return handleResponse(data, {});
}

export function useAllWallets(): Wallet[] {
  const data = useRecoilValueLoadable(allWallets);
  return handleResponse(data, []);
}
