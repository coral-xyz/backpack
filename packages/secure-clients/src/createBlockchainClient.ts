import { Blockchain } from "@coral-xyz/common";
import type {
  SecureUserType,
  TransportSender,
} from "@coral-xyz/secure-background/types";
import { Connection } from "@solana/web3.js";

import { getBlockchainConfig } from "..";

import { EthereumClient } from "./EthereumClient/EthereumClient";
import { SolanaClient } from "./SolanaClient/SolanaClient";
import type { BlockchainClient } from "./BlockchainClientBase";

// Goal: This should be the ONLY blockchain-switch statement in the whole application.
export function createBlockchainClient<B extends Blockchain>(
  blockchain: B, // select blockchain
  transportSender: TransportSender, // get from secureBackgroundTransportAtom
  user?: SecureUserType & {
    publicKeys: NonNullable<SecureUserType["publicKeys"]>;
  } // get from secureUserAtom
): BlockchainClient<B> {
  switch (blockchain) {
    case Blockchain.SOLANA: {
      const preferences = getBlockchainConfig(blockchain);
      const connectionUrl =
        user?.preferences.blockchains.solana.connectionUrl ??
        preferences.PreferencesDefault.connectionUrl;
      const commitment =
        user?.preferences.blockchains.solana.commitment ??
        preferences.PreferencesDefault.commitment;
      const client: BlockchainClient<Blockchain.SOLANA> = new SolanaClient(
        transportSender,
        new Connection(connectionUrl, commitment)
      );
      // this cast is safe due to switch statement;
      return client as BlockchainClient<B>;
    }
    case Blockchain.ETHEREUM: {
      const client: BlockchainClient<Blockchain.ETHEREUM> = new EthereumClient(
        transportSender
      );

      // this cast is safe due to switch statement;
      return client as BlockchainClient<B>;
    }

    default: {
      throw new Error(
        `Failed to create BlockchainClient. Unknown blockchain: ${blockchain}`
      );
    }
  }
}
