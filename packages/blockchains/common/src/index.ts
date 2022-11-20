import { Blockchain, DerivationPath } from "@coral-xyz/common";
import {
  EthereumHdKeyringFactory,
  EthereumKeyringFactory,
  EthereumLedgerKeyringFactory,
} from "@coral-xyz/blockchain-evm";
import {
  SolanaHdKeyringFactory,
  SolanaKeyringFactory,
  SolanaLedgerKeyringFactory,
} from "@coral-xyz/blockchain-solana";
import { BlockchainKeyring } from "./blockchain";

export function hdFactoryForBlockchain(blockchain: Blockchain) {
  return {
    [Blockchain.SOLANA]: new SolanaHdKeyringFactory(),
    [Blockchain.ETHEREUM]: new EthereumHdKeyringFactory(),
  }[blockchain];
}

export function keyringForBlockchain(blockchain: Blockchain) {
  return {
    [Blockchain.SOLANA]: new BlockchainKeyring(
      new SolanaHdKeyringFactory(),
      new SolanaKeyringFactory(),
      new SolanaLedgerKeyringFactory()
    ),
    [Blockchain.ETHEREUM]: new BlockchainKeyring(
      new EthereumHdKeyringFactory(),
      new EthereumKeyringFactory(),
      new EthereumLedgerKeyringFactory()
    ),
  }[blockchain];
}

export function derivePathStr(
  blockchain: Blockchain,
  derivationPath: DerivationPath,
  accountIndex: number
): string {
  const coinType = {
    [Blockchain.ETHEREUM]: 60,
    [Blockchain.SOLANA]: 501,
  }[blockchain];
  switch (derivationPath) {
    case DerivationPath.Bip44:
      return accountIndex === 0
        ? `m/44'/${coinType}'`
        : `m/44'/${coinType}'/${accountIndex - 1}'`;
    case DerivationPath.Bip44Change:
      return `m/44'/${coinType}'/${accountIndex}'/0'`;
    default:
      throw new Error(`invalid derivation path: ${derivationPath}`);
  }
}

export * from "./types";
export * from "./blockchain";
export * from "./ledger";
