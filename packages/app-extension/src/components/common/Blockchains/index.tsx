import * as anchor from "@coral-xyz/anchor";
import {
  Blockchain,
  NATIVE_ACCOUNT_RENT_EXEMPTION_LAMPORTS,
} from "@coral-xyz/common";
import {
  DEFAULT_SOLANA_CLUSTER,
  EthereumConnectionUrl,
} from "@coral-xyz/secure-background/legacyCommon";
import type { EthereumContext } from "@coral-xyz/secure-clients/legacyCommon";
import {
  ETH_NATIVE_MINT,
  SOL_NATIVE_MINT,
} from "@coral-xyz/secure-clients/legacyCommon";
import { Connection as SolanaConnection, PublicKey } from "@solana/web3.js";
import { BigNumber, ethers } from "ethers";

export const BLOCKCHAIN_COMPONENTS: Record<
  Blockchain,
  {
    // this should be replaced with graphql
    LoadBalances: (
      publicKeys: string[]
    ) => Promise<
      Array<{ publicKey: string; balance: BigNumber; index: number }>
    >;

    // blockchainClient.transferAsset should accept "MAX" as `amount`.
    // Fees are minimal so UI should not need to change.
    // Fee amount to offset a token transfer when clicking the "max" button.
    MaxFeeOffset: (
      token: { address: string; mint?: string },
      ethereumCtx?: EthereumContext
    ) => BigNumber;
  }
> = {
  [Blockchain.ETHEREUM]: {
    LoadBalances: async (publicKeys: string[]) => {
      // TODO use Backpack configured value
      const ethereumMainnetRpc =
        process.env.DEFAULT_ETHEREUM_CONNECTION_URL ||
        EthereumConnectionUrl.MAINNET;
      const ethereumProvider = new ethers.providers.JsonRpcProvider(
        ethereumMainnetRpc
      );
      const balances = await Promise.all(
        publicKeys.map((p) => ethereumProvider.getBalance(p))
      );
      return publicKeys.map((p, index) => {
        return { publicKey: p, balance: balances[index], index };
      });
    },

    MaxFeeOffset: (
      token: { address: string; mint?: string },
      ethereumCtx?: any
    ) => {
      if (token.address === ETH_NATIVE_MINT) {
        // 21,000 GWEI for a standard ETH transfer
        return BigNumber.from("21000")
          .mul(ethereumCtx?.feeData.maxFeePerGas!)
          .add(
            BigNumber.from("21000").mul(
              ethereumCtx?.feeData.maxPriorityFeePerGas!
            )
          );
      }
      return BigNumber.from(0);
    },
  },
  [Blockchain.SOLANA]: {
    LoadBalances: async (publicKeys: string[]) => {
      // TODO use Backpack configured value
      const solanaMainnetRpc =
        process.env.DEFAULT_SOLANA_CONNECTION_URL || DEFAULT_SOLANA_CLUSTER;
      const solanaConnection = new SolanaConnection(
        solanaMainnetRpc,
        "confirmed"
      );
      const accounts = (
        await anchor.utils.rpc.getMultipleAccounts(
          solanaConnection,
          publicKeys.map((p) => new PublicKey(p))
        )
      ).map((result, index) => {
        return {
          publicKey: publicKeys[index],
          balance: result
            ? BigNumber.from(result.account.lamports)
            : BigNumber.from(0),
          index,
        };
      });
      return accounts;
    },

    MaxFeeOffset: (token: { address: string; mint?: string }) => {
      if (token.mint === SOL_NATIVE_MINT) {
        // When sending SOL, account for the tx fee and rent exempt minimum.
        return BigNumber.from(5000).add(
          BigNumber.from(NATIVE_ACCOUNT_RENT_EXEMPTION_LAMPORTS)
        );
      }
      return BigNumber.from(0);
    },
  },
  [Blockchain.ECLIPSE]: {
    LoadBalances: async (publicKeys: string[]) => {
      // TODO use Backpack configured value
      const solanaMainnetRpc =
        process.env.DEFAULT_ECLIPSE_CONNECTION_URL ||
        "https://api.injective.eclipsenetwork.xyz:8899/"; //todo
      const solanaConnection = new SolanaConnection(
        solanaMainnetRpc,
        "confirmed"
      );
      const accounts = (
        await anchor.utils.rpc.getMultipleAccounts(
          solanaConnection,
          publicKeys.map((p) => new PublicKey(p))
        )
      ).map((result, index) => {
        return {
          publicKey: publicKeys[index],
          balance: result
            ? BigNumber.from(result.account.lamports)
            : BigNumber.from(0),
          index,
        };
      });
      return accounts;
    },

    MaxFeeOffset: (_token: { address: string; mint?: string }) => {
      // TODO: check with eclipse team.
      return BigNumber.from(0);
    },
  },
};
