import {
  deriveEthereumPrivateKey,
  EthereumHdKeyringFactory,
  EthereumKeyringFactory,
  EthereumLedgerKeyringFactory,
} from "@coral-xyz/blockchain-evm";
import { BlockchainKeyring } from "@coral-xyz/blockchain-keyring";
import {
  deriveSolanaPrivateKey,
  SolanaHdKeyringFactory,
  SolanaKeyringFactory,
  SolanaLedgerKeyringFactory,
} from "@coral-xyz/blockchain-solana";
import { Blockchain } from "@coral-xyz/common";
import { mnemonicToSeedSync } from "bip39";

export function hdFactoryForBlockchain(blockchain: Blockchain) {
  return {
    [Blockchain.SOLANA]: new SolanaHdKeyringFactory(),
    [Blockchain.ETHEREUM]: new EthereumHdKeyringFactory(),
  }[blockchain];
}

export function keyringForBlockchain(
  blockchain: Blockchain
): BlockchainKeyring {
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

export function mnemonicPathToPrivateKey(
  blockchain: Blockchain,
  mnemonic: string,
  derivationPath: string
) {
  const seed = mnemonicToSeedSync(mnemonic);
  if (blockchain === Blockchain.ETHEREUM) {
    return deriveEthereumPrivateKey(seed, derivationPath);
  } else if (blockchain === Blockchain.SOLANA) {
    return Buffer.from(deriveSolanaPrivateKey(seed, derivationPath)).toString(
      "hex"
    );
  }
  throw new Error("invalid blockchain");
}
