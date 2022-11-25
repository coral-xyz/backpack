import { useRecoilValue } from "recoil";
import { Blockchain } from "@coral-xyz/common";
import * as atoms from "../atoms";
import type { TokenData } from "../types";

/**
 * Enabled blockchains are blockchains that are currently active in the wallet.
 */
export function useEnabledBlockchains() {
  return useRecoilValue(atoms.enabledBlockchains);
}

/**
 * Available blockchains are blockchains thate can be used but may or may not be
 * enabled.
 */
export function useAvailableBlockchains() {
  return useRecoilValue(atoms.availableBlockchains);
}

export function useBlockchainKeyrings() {
  return useRecoilValue(atoms.blockchainKeyrings);
}

export function useBlockchainSettings(blockchain: Blockchain) {
  return useRecoilValue(atoms.blockchainSettings(blockchain));
}

export function useBlockchainExplorer(blockchain: Blockchain) {
  const blockchainSettings = useBlockchainSettings(blockchain);
  return blockchainSettings.explorer;
}

export function useBlockchainConnectionUrl(blockchain: Blockchain) {
  const blockchainSettings = useBlockchainSettings(blockchain);
  return blockchainSettings.connectionUrl;
}

// TODO(peter) consolidate between extension/mobile-app or just live on S3
export function useBlockchainLogo(blockchain: Blockchain): string {
  switch (blockchain) {
    case Blockchain.ETHEREUM:
      return "./ethereum.png";
    case Blockchain.SOLANA:
      return "/solana.png";
    default:
      throw new Error(`invalid blockchain ${blockchain}`);
  }
}

export function useBlockchainTokens(blockchain: Blockchain) {
  return useRecoilValue(atoms.blockchainTokenAddresses(blockchain));
}

export function useBlockchainTokensSorted(blockchain: Blockchain) {
  return useRecoilValue(atoms.blockchainBalancesSorted(blockchain));
}

export function useBlockchainNativeTokens(blockchain: Blockchain) {
  return useRecoilValue(atoms.blockchainNativeBalances(blockchain));
}

export function useBlockchainTokenAccount(
  blockchain: Blockchain,
  address: string
): TokenData | null {
  return useRecoilValue(atoms.blockchainTokenData({ blockchain, address }));
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
