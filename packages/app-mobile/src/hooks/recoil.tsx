import { Blockchain } from "@coral-xyz/common";
import {
  activeSolanaWallet,
  activeEthereumWallet,
  blockchainTokenData,
  totalBalance as totalBalanceSelector,
} from "@coral-xyz/recoil";
import { useRecoilValueLoadable } from "recoil";

type Response = {
  loading: boolean;
  error: boolean;
  data: any;
};

function wrapResponse(data: any): Response {
  return {
    loading: data.state === "loading",
    error: data.state === "hasError",
    data: data.state === "hasValue" ? data.contents : null,
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
