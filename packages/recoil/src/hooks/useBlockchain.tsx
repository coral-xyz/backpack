/* eslint-disable react-hooks/rules-of-hooks */
import { Blockchain } from "@coral-xyz/common";
import { useRecoilValue } from "recoil";

import * as atoms from "../atoms";
import type { TokenDataWithPrice } from "../types";

export function useEnabledBlockchains() {
  return useRecoilValue(atoms.enabledBlockchains);
}

export function useAvailableBlockchains() {
  return useRecoilValue(atoms.availableBlockchains);
}

export function useBlockchainExplorer(blockchain: Blockchain) {
  switch (blockchain) {
    case Blockchain.ETHEREUM:
      return useRecoilValue(atoms.ethereumExplorer);
    case Blockchain.SOLANA:
      return useRecoilValue(atoms.solanaExplorer);
    default:
      throw new Error(`invalid blockchain ${blockchain}`);
  }
}

export function useBlockchainConnectionUrl(blockchain: Blockchain) {
  switch (blockchain) {
    case Blockchain.ETHEREUM:
      return useRecoilValue(atoms.ethereumConnectionUrl);
    case Blockchain.SOLANA:
      return useRecoilValue(atoms.solanaConnectionUrl);
    default:
      throw new Error(`invalid blockchain ${blockchain}`);
  }
}

// TODO(peter) consolidate between extension/mobile-app or just live on S3
export function getBlockchainLogo(blockchain: Blockchain): string {
  switch (blockchain) {
    case Blockchain.ETHEREUM:
      return "./ethereum.png";
    case Blockchain.SOLANA:
      return "/solana.png";
    default:
      throw new Error(`invalid blockchain ${blockchain}`);
  }
}

export function useBlockchainTokens({
  publicKey,
  blockchain,
}: {
  publicKey: string;
  blockchain: Blockchain;
}) {
  return useRecoilValue(
    atoms.blockchainTokenAddresses({
      publicKey,
      blockchain,
    })
  );
}

export function useBlockchainTokensSorted({
  publicKey,
  blockchain,
}: {
  publicKey: string;
  blockchain: Blockchain;
}) {
  return useRecoilValue(
    atoms.blockchainBalancesSorted({
      publicKey,
      blockchain,
    })
  );
}

export function useBlockchainNativeTokens({
  publicKey,
  blockchain,
}: {
  publicKey: string;
  blockchain: Blockchain;
}) {
  return useRecoilValue(
    atoms.blockchainNativeBalances({ publicKey, blockchain })
  );
}

export function useBlockchainTokenAccount({
  publicKey,
  blockchain,
  tokenAddress,
}: {
  publicKey: string;
  blockchain: Blockchain;
  tokenAddress: string;
}): TokenDataWithPrice | null {
  return useRecoilValue(
    atoms.blockchainTokenData({ publicKey, blockchain, tokenAddress })
  );
}

export function useBlockchainActiveWallet(blockchain: Blockchain) {
  switch (blockchain) {
    case Blockchain.ETHEREUM:
      return useRecoilValue(atoms.activeEthereumWallet)!;
    case Blockchain.SOLANA:
      return useRecoilValue(atoms.activeSolanaWallet)!;
    default:
      throw new Error(`invalid blockchain ${blockchain}`);
  }
}
