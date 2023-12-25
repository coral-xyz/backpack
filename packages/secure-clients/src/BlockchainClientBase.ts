import type { Blockchain } from "@coral-xyz/common";
import type { BlockchainConfig } from "@coral-xyz/secure-background/types";

import type { EthereumClient } from "./EthereumClient/EthereumClient";
import type { SolanaClient } from "./SolanaClient/SolanaClient";

export type BlockchainClient<B extends Blockchain = Blockchain> =
  B extends Blockchain.ETHEREUM
    ? EthereumClient
    : B extends Blockchain.SOLANA
    ? SolanaClient
    : B extends Blockchain.ECLIPSE
    ? SolanaClient
    : never;

export type BlockchainReceipt<B extends Blockchain = Blockchain> =
  B extends Blockchain.ETHEREUM
    ? string
    : B extends Blockchain.SOLANA
    ? string
    : B extends Blockchain.ECLIPSE
    ? string
    : never;

export type BlockchainConfirmation<B extends Blockchain = Blockchain> =
  B extends Blockchain.ETHEREUM
    ? true
    : B extends Blockchain.SOLANA
    ? true
    : B extends Blockchain.ECLIPSE
    ? true
    : never;

export type BackpackAssetId = string;
export type BackpackEntity = {
  publicKey: string;
  username?: string;
  image?: string;
  walletName?: string;
};

export abstract class BlockchainClientBase<B extends Blockchain = Blockchain> {
  // @ts-ignore strictPropertyInitialization -> not applicable to abstract class
  public config: BlockchainConfig<B>;

  public abstract transferAsset(req: {
    assetId: BackpackAssetId;
    from: BackpackEntity;
    to: BackpackEntity;
    amount: string;
  }): Promise<BlockchainReceipt<B>>;

  public abstract burnAsset(req: {
    assetId: BackpackAssetId;
    from: BackpackEntity;
    amount?: string;
  }): Promise<BlockchainReceipt<B>>;

  public abstract confirmTransaction(
    tx: BlockchainReceipt<B>
  ): Promise<BlockchainConfirmation<B>>;

  public abstract previewPublicKeys(
    derivationPaths: string[],
    mnemonic?: true | string
  ): Promise<
    {
      blockchain: Blockchain;
      publicKey: string;
      derivationPath: string;
    }[]
  >;
}
