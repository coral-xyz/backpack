import { Blockchain } from "@coral-xyz/common";
import { getBlockchainConfig } from "@coral-xyz/secure-clients";
import { useRecoilValue } from "recoil";

import * as atoms from "../atoms";

export function useEnabledBlockchains(): Blockchain[] {
  return useRecoilValue(atoms.enabledBlockchains);
}
export function useEnabledBlockchainsNullable(): Blockchain[] | null {
  return useRecoilValue(atoms.enabledBlockchainsNullable);
}

export function useAvailableBlockchains(): Blockchain[] {
  return useRecoilValue(atoms.availableBlockchains);
}

export function useBlockchainExplorer(blockchain: Blockchain) {
  return useRecoilValue(atoms.blockchainExplorer(blockchain));
}

export function useBlockchainExplorerNullable(blockchain: Blockchain) {
  return useRecoilValue(atoms.blockchainExplorerNullable(blockchain));
}

export function useBlockchainConnectionUrl(blockchain: Blockchain) {
  return useRecoilValue(atoms.blockchainConnectionUrl(blockchain));
}

export function useBlockchainConnectionUrlNullable(blockchain: Blockchain) {
  return useRecoilValue(atoms.blockchainConnectionUrlNullable(blockchain));
}

// TODO(peter) consolidate between extension/mobile-app or just live on S3
export function getBlockchainLogo(
  blockchain: Blockchain,
  remote?: boolean
): string {
  const config = getBlockchainConfig(blockchain);
  return remote ? config.logoUri : config.localLogoUri;
}

export function useBlockchainActiveWallet(blockchain: Blockchain) {
  const value = (() => {
    switch (blockchain) {
      case Blockchain.ETHEREUM:
        return atoms.activeEthereumWallet!;
      case Blockchain.SOLANA:
        return atoms.activeSolanaWallet!;
      default:
        throw new Error(`invalid blockchain ${blockchain}`);
    }
  })();
  return useRecoilValue(value)!;
}
