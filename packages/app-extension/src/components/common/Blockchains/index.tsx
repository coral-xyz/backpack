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
import Ethereum from "@ledgerhq/hw-app-eth";
import Solana from "@ledgerhq/hw-app-solana";
import type Transport from "@ledgerhq/hw-transport";
import { Connection as SolanaConnection, PublicKey } from "@solana/web3.js";
import { BigNumber, ethers } from "ethers";

import { SendEvmConfirmationCard } from "../../../components/Unlocked/Balances/TokensWidget/Ethereum";
import { SendSvmConfirmationCard } from "../../../components/Unlocked/Balances/TokensWidget/Solana";
import {
  EclipseIconOnboarding as EclipseIcon,
  EthereumIconOnboarding as EthereumIcon,
  SolanaIconOnboarding as SolanaIcon,
} from "../../common/Icon";
const { base58 } = ethers.utils;

type LedgerApp = Ethereum | Solana;

export const BLOCKCHAIN_COMPONENTS: Record<
  Blockchain,
  {
    // Enabled: boolean;
    // Name: string;
    // AppTokenName: string;
    // GasTokenName: string;
    // GasTokenDecimals: number;
    // RampSupportedTokens: Array<{
    //   title: string;
    //   icon: string;
    //   subtitle: string;
    // }>;
    // DerivationPathOptions: Array<{
    //   path: (i: number) => BIPPath;
    //   label: string;
    // }>;

    ////////////////////////////////////////////////////////////////////
    // Everything below is not needed for secure-backround / client / ui
    Icon: any;

    // ledger UI & App connection is directly handled in secure-ui components.
    LedgerText: string;
    LedgerApp: (transport: Transport) => LedgerApp;
    PublicKeyFromPath: (
      ledgerWallet: LedgerApp,
      path: string
    ) => Promise<string>;

    // this should be replaced with graphql
    LoadBalances: (
      publicKeys: string[]
    ) => Promise<
      Array<{ publicKey: string; balance: BigNumber; index: number }>
    >;

    // All blockchains will use the same components once global assetId exists.
    SendTokenConfirmationCard: (props: {
      token: {
        id: string;
        address: string;
        logo: string;
        decimals: number;
        tokenId?: string;
        mint?: string;
      };
      destinationAddress: string;
      destinationUser?: {
        username: string;
        walletName?: string;
        image: string;
      };
      amount: BigNumber;
      onClose?: () => void;
      onComplete?: (txSig?: any) => void;
      onViewBalances?: () => void;
    }) => any;
    SendNftConfirmationCard: (props: {
      nft: any;
      destinationAddress: string;
      destinationUser?: {
        username: string;
        walletName?: string;
        image: string;
      };
      amount: BigNumber;
      onClose?: () => void;
      onComplete?: (txSig?: any) => void;
    }) => any;

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
    Icon: () => <EthereumIcon />,
    LedgerText: "Open the Ethereum app",
    LedgerApp: (transport: Transport) => new Ethereum(transport as any),
    PublicKeyFromPath: async (ledgerWallet: LedgerApp, path: string) => {
      const ledgerAddress = (
        await ledgerWallet.getAddress(path.replace("m/", ""))
      ).address;
      const publicKey = ledgerAddress.toString();
      return publicKey;
    },

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
    SendTokenConfirmationCard: ({
      token,
      destinationAddress,
      destinationUser,
      amount,
      onComplete,
      onClose,
      onViewBalances,
    }: {
      token: {
        id: string;
        address: string;
        logo: string;
        decimals: number;
        // For ERC721 sends
        tokenId?: string;
      };
      destinationUser?: {
        username: string;
        image: string;
      };
      destinationAddress: string;
      amount: BigNumber;
      onComplete?: () => void;
      onClose?: () => void;
      onViewBalances?: () => void;
    }) => {
      return (
        <SendEvmConfirmationCard
          onClose={onClose}
          token={token}
          destinationAddress={destinationAddress}
          destinationUser={destinationUser}
          amount={amount}
          onComplete={onComplete}
          onViewBalances={onViewBalances}
          blockchain={Blockchain.ETHEREUM}
        />
      );
    },
    SendNftConfirmationCard: ({
      onClose,
      nft,
      destinationAddress,
      destinationUser,
      amount,
      onComplete,
    }: {
      nft: any; // todo: type
      destinationAddress: string;
      destinationUser?: {
        username: string;
        walletName?: string;
        image: string;
      };
      amount: BigNumber;
      onClose?: () => void;
      onComplete?: (txSig?: any) => void;
    }) => {
      return (
        <SendEvmConfirmationCard
          token={{
            id: nft.id,
            logo: nft.imageUrl,
            decimals: 0, // Are there any NFTs that don't use decimals 0?
            address: nft.mint.split("/")[0],
            tokenId: nft.mint.split("/")[1],
            name: nft.name,
          }}
          destinationUser={destinationUser}
          destinationAddress={destinationAddress}
          amount={amount}
          onComplete={onComplete}
          onViewBalances={onClose}
          blockchain={Blockchain.ETHEREUM}
        />
      );
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
    Icon: () => <SolanaIcon />,
    LedgerText: "Open the Solana app",
    LedgerApp: (transport: Transport) => new Solana(transport as any),
    PublicKeyFromPath: async (ledgerWallet: LedgerApp, path: string) => {
      const ledgerAddress = (
        await ledgerWallet.getAddress(path.replace("m/", ""))
      ).address;
      const publicKey = base58.encode(ledgerAddress as Buffer);
      return publicKey;
    },
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
    SendTokenConfirmationCard: ({
      token,
      destinationAddress,
      destinationUser,
      amount,
      onComplete,
      onClose,
      onViewBalances,
    }: {
      token: {
        id: string;
        address: string;
        logo: string;
        decimals: number;
        tokenId?: string;
        mint?: string;
      };
      destinationAddress: string;
      destinationUser?: {
        username: string;
        walletName?: string;
        image: string;
      };
      amount: BigNumber;
      onComplete?: (txSig?: any) => void;
      onViewBalances?: () => void;
      onClose?: () => void;
    }) => {
      return (
        <SendSvmConfirmationCard
          token={{ ...token, token: token.address }}
          destinationAddress={destinationAddress}
          destinationUser={destinationUser}
          amount={amount}
          onComplete={onComplete}
          onClose={onClose}
          onViewBalances={onViewBalances}
          blockchain={Blockchain.SOLANA}
        />
      );
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
    SendNftConfirmationCard: ({
      nft,
      destinationAddress,
      destinationUser,
      amount,
      onClose,
      onComplete,
    }: {
      nft: any; // todo: type
      destinationAddress: string;
      destinationUser?: {
        username: string;
        walletName?: string;
        image: string;
      };
      amount: BigNumber;
      onComplete?: (txSig?: any) => void;
      onClose?: () => void;
    }) => {
      return (
        <SendSvmConfirmationCard
          token={{
            id: nft.id,
            logo: nft.imageUrl,
            decimals: 0, // Are there any NFTs that don't use decimals 0?
            mint: nft.mint,
            token: nft.token,
            compressed: nft.compressed,
            compressionData: nft.compressionData,
          }}
          destinationUser={destinationUser}
          destinationAddress={destinationAddress}
          amount={amount}
          onComplete={onComplete}
          onViewBalances={onClose}
          blockchain={Blockchain.SOLANA}
        />
      );
    },
  },
  [Blockchain.ECLIPSE]: {
    LedgerText: "Open the Solana app",
    LedgerApp: (transport: Transport) => new Solana(transport as any),
    PublicKeyFromPath: async (ledgerWallet: LedgerApp, path: string) => {
      const ledgerAddress = (
        await ledgerWallet.getAddress(path.replace("m/", ""))
      ).address;
      const publicKey = base58.encode(ledgerAddress as Buffer);
      return publicKey;
    },
    Icon: () => <EclipseIcon />,
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
    SendTokenConfirmationCard: ({
      token,
      destinationAddress,
      destinationUser,
      amount,
      onComplete,
      onViewBalances,
    }: {
      token: {
        id: string;
        address: string;
        logo: string;
        decimals: number;
        tokenId?: string;
        mint?: string;
      };
      destinationAddress: string;
      destinationUser?: {
        username: string;
        walletName?: string;
        image: string;
      };
      amount: BigNumber;
      onComplete?: (txSig?: any) => void;
      onViewBalances?: () => void;
    }) => {
      return (
        <SendSvmConfirmationCard
          token={{ ...token, token: token.address }}
          destinationAddress={destinationAddress}
          destinationUser={destinationUser}
          amount={amount}
          onComplete={onComplete}
          onViewBalances={onViewBalances}
          blockchain={Blockchain.ECLIPSE}
        />
      );
    },
    MaxFeeOffset: (_token: { address: string; mint?: string }) => {
      // TODO: check with eclipse team.
      return BigNumber.from(0);
    },
    SendNftConfirmationCard: ({
      nft,
      destinationAddress,
      destinationUser,
      amount,
      onClose,
      onComplete,
    }: {
      nft: any; // todo: type
      destinationAddress: string;
      destinationUser?: {
        username: string;
        walletName?: string;
        image: string;
      };
      amount: BigNumber;
      onClose?: () => void;
      onComplete?: (txSig?: any) => void;
    }) => {
      return (
        <SendSvmConfirmationCard
          token={{
            id: nft.id,
            logo: nft.imageUrl,
            decimals: 0, // Are there any NFTs that don't use decimals 0?
            mint: nft.mint,
            token: nft.token,
          }}
          destinationUser={destinationUser}
          destinationAddress={destinationAddress}
          amount={amount}
          onComplete={onComplete}
          onViewBalances={onClose}
          blockchain={Blockchain.SOLANA}
        />
      );
    },
  },
};
