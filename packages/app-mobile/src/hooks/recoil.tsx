// This file is for cases where Suspense is acting up in React Native and we use useRecoilValueLoadable directly instead
import { Blockchain } from "@coral-xyz/common";
import {
  blockchainBalancesSorted,
  activeSolanaWallet,
  activeEthereumWallet,
  blockchainTokenData,
  totalBalance as totalBalanceSelector,
  blockchainTotalBalance,
  activeWallet,
  allWallets,
  nftCollectionsWithIds,
} from "@coral-xyz/recoil";
import { useRecoilValue, useRecoilValueLoadable } from "recoil";

import {
  result__useTotalBalance,
  result__useBlockchainBalancesSorted,
  result__useWalletBalance,
} from "./recoil__FAKE_DATA";

import { Wallet } from "~types/types";

type Response<T> = {
  loading: boolean;
  error: boolean;
  data: T;
};

type RecoilData = {
  state: "hasValue" | "loading" | "hasError";
  contents: Promise<any> | any;
};

// the successor to wrapResponse
function handleResponse(data: RecoilData, fallback: any) {
  return {
    data: data.state === "hasValue" ? data.contents : fallback,
    error: data.state === "hasError",
    loading: data.state === "loading",
  };
}

// First peter made this and it was fine
function wrapResponse(data: any, result = null) {
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
  return result__useTotalBalance;
  // const data = useRecoilValueLoadable(totalBalanceSelector);

  // return handleResponse(data, {
  //   totalBalance: 0,
  //   totalChange: 0,
  //   percentChange: 0,
  //   isLoading: true,
  // });
}

export function useWalletBalance(wallet: Wallet) {
  return {
    data: result__useWalletBalance,
    loading: false,
    error: false,
  };
  // const data = useRecoilValueLoadable(
  //   blockchainTotalBalance({
  //     publicKey: wallet.publicKey,
  //     blockchain: wallet.blockchain,
  //   })
  // );
  //
  // return handleResponse(data, {
  //   percentChange: 0,
  //   totalBalance: 0,
  //   totalChange: 0,
  // });
}

export function useActiveWallet(): Wallet | object {
  const data = useRecoilValueLoadable(activeWallet);
  return handleResponse(data, {});
}

export function useAllWallets(): Response<Wallet[]> {
  const data = useRecoilValueLoadable(allWallets);
  return handleResponse(data, []);
}

// TODO blockchain balances sorted only needs:
export function useBlockchainBalancesSorted({ publicKey, blockchain }) {
  const data = useRecoilValueLoadable(
    blockchainBalancesSorted({
      publicKey: publicKey.toString(),
      blockchain,
    })
  );

  return handleResponse(data, []);
}

export function useActiveWalletCollections() {
  const allWalletCollections = useRecoilValue(nftCollectionsWithIds);
  const { data: activeWallet } = useActiveWallet();

  const pk = activeWallet.publicKey;
  const list = allWalletCollections.find((c) => c.publicKey === pk);

  if (list) {
    return list.collections;
  }

  return [];
}
