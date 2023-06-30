import type { EthereumContext } from "@coral-xyz/common";
import {
  Blockchain,
  DEFAULT_SOLANA_CLUSTER,
  ETH_NATIVE_MINT,
  EthereumConnectionUrl,
  ethereumIndexed,
  legacyBip44ChangeIndexed,
  legacyBip44Indexed,
  legacyEthereum,
  legacyLedgerIndexed,
  legacyLedgerLiveAccount,
  legacySolletIndexed,
  NATIVE_ACCOUNT_RENT_EXEMPTION_LAMPORTS,
  SOL_NATIVE_MINT,
} from "@coral-xyz/common";
import { SOL_LOGO_URI } from "@coral-xyz/recoil";
import Ethereum from "@ledgerhq/hw-app-eth";
import Solana from "@ledgerhq/hw-app-solana";
import type Transport from "@ledgerhq/hw-transport";
import * as anchor from "@project-serum/anchor";
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
type BIPPath = any;

export const BLOCKCHAIN_COMPONENTS: Record<
  Blockchain,
  {
    Enabled: boolean;
    Name: string;
    GasTokenName: string;
    AppTokenName: string;
    LedgerText: string;
    LedgerApp: (transport: Transport) => LedgerApp;
    PublicKeyFromPath: (
      ledgerWallet: LedgerApp,
      path: string
    ) => Promise<string>;
    Icon: any;
    RampSupportedTokens: Array<{
      title: string;
      icon: string;
      subtitle: string;
    }>;
    DerivationPathOptions: Array<{
      path: (i: number) => BIPPath;
      label: string;
    }>;
    // TODO: this should be replaced with graphql?
    LoadBalances: (
      publicKeys: string[]
    ) => Promise<
      Array<{ publicKey: string; balance: BigNumber; index: number }>
    >;
    GasTokenDecimals: number;
    SendTokenConfirmationCard: ({
      token,
      destinationAddress,
      destinationUser,
      amount,
      onComplete,
      onViewBalances,
    }: {
      token: {
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
    }) => any;
    SendNftConfirmationCard: ({
      nft,
      destinationAddress,
      destinationUser,
      amount,
      onComplete,
    }: {
      nft: any;
      destinationAddress: string;
      destinationUser?: {
        username: string;
        walletName?: string;
        image: string;
      };
      amount: BigNumber;
      onComplete?: (txSig?: any) => void;
    }) => any;
    // Fee amount to offset a token transfer when clicking the "max" button.
    MaxFeeOffset: (
      token: { address: string; mint?: string },
      ethereumCtx?: EthereumContext
    ) => BigNumber;
  }
> = {
  [Blockchain.ETHEREUM]: {
    Enabled: true,
    Name: "Ethereum",
    GasTokenName: "ETH",
    AppTokenName: "ERC20",
    LedgerText: "Open the Ethereum app",
    LedgerApp: (transport: Transport) => new Ethereum(transport),
    PublicKeyFromPath: async (ledgerWallet: LedgerApp, path: string) => {
      const ledgerAddress = (
        await ledgerWallet.getAddress(path.replace("m/", ""))
      ).address;
      const publicKey = ledgerAddress.toString();
      return publicKey;
    },
    Icon: () => <EthereumIcon />,
    RampSupportedTokens: [
      {
        title: "ETH",
        subtitle: "Ethereum",
        icon: "/ethereum.png",
      },
    ],
    DerivationPathOptions: [
      {
        path: (i: number) => legacyEthereum(i),
        label: "m/44/60'/x",
      },
      {
        path: (i: number) => legacyLedgerIndexed(i),
        label: "m/44'/60'/0'/x' - Ledger",
      },
      {
        path: (i: number) => legacyLedgerLiveAccount(i),
        label: "m/44'/60'/x'/0/0 - Ledger Live",
      },
      {
        path: (i: number) => ethereumIndexed(i),
        label: "m/44'/60'/0'/0/x - Ethereum Standard",
      },
    ],
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
    GasTokenDecimals: 18,
    SendTokenConfirmationCard: ({
      token,
      destinationAddress,
      destinationUser,
      amount,
      onComplete,
      onViewBalances,
    }: {
      token: {
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
      onViewBalances?: () => void;
    }) => {
      return (
        <SendEvmConfirmationCard
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
      onComplete?: (txSig?: any) => void;
    }) => {
      return (
        <SendEvmConfirmationCard
          token={{
            logo: nft.imageUrl,
            decimals: 0, // Are there any NFTs that don't use decimals 0?
            address: nft.contractAddress,
            tokenId: nft.tokenId,
          }}
          destinationUser={destinationUser}
          destinationAddress={destinationAddress}
          amount={amount}
          onComplete={onComplete}
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
    Enabled: true,
    Name: "Solana",
    GasTokenName: "SOL",
    AppTokenName: "SPL",
    LedgerText: "Open the Solana app",
    LedgerApp: (transport: Transport) => new Solana(transport),
    PublicKeyFromPath: async (ledgerWallet: LedgerApp, path: string) => {
      const ledgerAddress = (
        await ledgerWallet.getAddress(path.replace("m/", ""))
      ).address;
      const publicKey = base58.encode(ledgerAddress as Buffer);
      return publicKey;
    },
    Icon: () => <SolanaIcon />,
    RampSupportedTokens: [
      {
        title: "SOL",
        icon: SOL_LOGO_URI,
        subtitle: "Solana",
      },
    ],
    DerivationPathOptions: [
      {
        path: (i: number) => legacyBip44Indexed(Blockchain.SOLANA, i),
        label: "m/44/501'/x'",
      },
      {
        path: (i: number) => legacyBip44ChangeIndexed(Blockchain.SOLANA, i),
        label: "m/44/501'/x'/0'",
      },
      {
        path: (i: number) =>
          legacyBip44ChangeIndexed(Blockchain.SOLANA, i) + "/0'",
        label: "m/44/501'/x'/0'/0'",
      },
    ]
      // Note: We only allow importing the deprecated sollet derivation path for
      //       hot wallets. This UI is hidden behind a local storage flag we
      //       expect people to manually set, since this derivation path was only
      //       used by mostly technical early Solana users.
      .concat(
        window.localStorage.getItem("sollet")
          ? [
              {
                path: (i: number) => legacySolletIndexed(i),
                label: "501'/0'/0/0 (Deprecated)",
              },
            ]
          : []
      ),
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
    GasTokenDecimals: 9,
    SendTokenConfirmationCard: ({
      token,
      destinationAddress,
      destinationUser,
      amount,
      onComplete,
      onViewBalances,
    }: {
      token: {
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
          token={token}
          destinationAddress={destinationAddress}
          destinationUser={destinationUser}
          amount={amount}
          onComplete={onComplete}
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
    }) => {
      return (
        <SendSvmConfirmationCard
          token={{
            address: nft.publicKey,
            logo: nft.imageUrl,
            decimals: 0, // Are there any NFTs that don't use decimals 0?
            mint: nft.mint,
          }}
          destinationUser={destinationUser}
          destinationAddress={destinationAddress}
          amount={amount}
          onComplete={onComplete}
          blockchain={Blockchain.SOLANA}
        />
      );
    },
  },
  [Blockchain.ECLIPSE]: {
    Enabled: true,
    Name: "Eclipse",
    GasTokenName: "ECL",
    AppTokenName: "SPL",
    LedgerText: "Open the Solana app",
    LedgerApp: (transport: Transport) => new Solana(transport),
    PublicKeyFromPath: async (ledgerWallet: LedgerApp, path: string) => {
      const ledgerAddress = (
        await ledgerWallet.getAddress(path.replace("m/", ""))
      ).address;
      const publicKey = base58.encode(ledgerAddress as Buffer);
      return publicKey;
    },
    Icon: () => <EclipseIcon />,
    RampSupportedTokens: [],
    DerivationPathOptions: [
      {
        path: (i: number) => legacyBip44Indexed(Blockchain.ECLIPSE, i),
        label: "m/44/501'/x'",
      },
      {
        path: (i: number) => legacyBip44ChangeIndexed(Blockchain.ECLIPSE, i),
        label: "m/44/501'/x'/0'",
      },
      {
        path: (i: number) =>
          legacyBip44ChangeIndexed(Blockchain.ECLIPSE, i) + "/0'",
        label: "m/44/501'/x'/0'/0'",
      },
    ],
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
    GasTokenDecimals: 9,
    SendTokenConfirmationCard: ({
      token,
      destinationAddress,
      destinationUser,
      amount,
      onComplete,
      onViewBalances,
    }: {
      token: {
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
          token={token}
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
    }) => {
      return (
        <SendSvmConfirmationCard
          token={{
            address: nft.publicKey,
            logo: nft.imageUrl,
            decimals: 0, // Are there any NFTs that don't use decimals 0?
            mint: nft.mint,
          }}
          destinationUser={destinationUser}
          destinationAddress={destinationAddress}
          amount={amount}
          onComplete={onComplete}
          blockchain={Blockchain.SOLANA}
        />
      );
    },
  },
};
