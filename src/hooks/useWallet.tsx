import { Blockhash, PublicKey, Connection, Transaction } from "@solana/web3.js";
import BN from "bn.js";
import {
  useRecoilValue,
  useRecoilValueLoadable,
  constSelector,
  Loadable,
} from "recoil";
import { TokenInfo } from "@solana/spl-token-registry";
import { Program, SplToken } from "@project-serum/anchor";
import * as atoms from "../recoil/atoms";
import { KeyringStoreStateEnum } from "../keyring/store";
import { useLoadSplTokens } from "../hooks/useLoadSplTokens";
import { useNavigation, useNavigationRoot } from "../hooks/useNavigation";
import { useTab } from "../hooks/useTab";
import { useKeyringStoreState } from "../hooks/useKeyringStoreState";
import { associatedTokenAddress } from "../common/token";
import {
  useLoadRecentBlockhash,
  useCommitment,
  useRecentBlockhash,
} from "./useRecentBlockhash";
import { useSplTokenRegistry } from "./useSplTokenRegistry";

// Bootstrap data for the initial load.
export function useBootstrap() {
  return useRecoilValue(atoms.bootstrap);
}

export function useBootstrapFast() {
  useRecoilValue(atoms.bootstrapFast);

  // Hack: load all the navigation atoms to prevent UI flickering.
  //       TODO: can batch these into a single request to the background script.
  const { tab } = useTab();
  useNavigationRoot(tab);
  useNavigation();
  useKeyringStoreState();
  useCommitment();
}

export function useBackgroundPoll() {
  useLoadSplTokens();
  useLoadRecentBlockhash();
}

export function useSolanaWallet(): SolanaWallet {
  return useRecoilValue(atoms.solanaWallet)!;
}

export function useSolanaWalletLoadable(): Loadable<SolanaWallet> {
  return useRecoilValueLoadable(atoms.solanaWallet)!;
}

export function useSolanaWalletCtx(): SolanaWalletContext {
  const wallet = useSolanaWallet();
  const recentBlockhash = useRecentBlockhash();
  const { tokenClient } = useAnchorContext();
  const registry = useSplTokenRegistry();
  return {
    wallet,
    recentBlockhash,
    tokenClient,
    registry,
  };
}

export function useWalletPublicKeys(): {
  hdPublicKeys: Array<{
    publicKey: PublicKey;
    name: string;
  }>;
  importedPublicKeys: Array<{
    publicKey: PublicKey;
    name: string;
  }>;
} {
  const keyringStoreState = useKeyringStoreState();
  const isLocked = keyringStoreState === KeyringStoreStateEnum.Locked;
  // @ts-ignore
  const keys = useRecoilValue(
    isLocked
      ? constSelector({ hdPublicKeys: [], importedPublicKeys: [] })
      : atoms.walletPublicKeys
  );
  return {
    hdPublicKeys: keys.hdPublicKeys.map((k) => {
      return {
        publicKey: new PublicKey(k.publicKey),
        name: k.name,
      };
    }),
    importedPublicKeys: keys.importedPublicKeys.map((k) => {
      return {
        publicKey: new PublicKey(k.publicKey),
        name: k.name,
      };
    }),
  };
}

export function useActiveWallet(): { publicKey: PublicKey; name: string } {
  const { publicKey, name } = useRecoilValue(atoms.activeWalletWithName)!;
  return {
    publicKey: new PublicKey(publicKey),
    name,
  };
}

export function useAnchorContext() {
  return useRecoilValue(atoms.anchorContext);
}

export function useAnchorContextLoadable(): Loadable<any> {
  return useRecoilValueLoadable(atoms.anchorContext);
}

export type ConnectionContext = {
  connection: Connection;
  connectionUrl: string;
  setConnectionUrl: (url: string) => void;
};

interface Wallet {
  publicKey: string;
  signTransaction(tx: any): any;
}

export class SolanaWallet {
  constructor(readonly publicKey: PublicKey) {}

  async transferToken(
    ctx: SolanaWalletContext,
    req: TransferTokenRequest
  ): Promise<string> {
    const { mint, destination, amount } = req;
    const { registry, recentBlockhash, tokenClient } = ctx;

    const tokenInfo = registry.get(mint.toString());
    if (!tokenInfo) {
      console.error(" no token info found", mint);
      throw new Error("no token info found");
    }
    const decimals = tokenInfo.decimals;

    const sourceAta = associatedTokenAddress(mint, this.publicKey);
    const destinationAta = associatedTokenAddress(mint, destination);
    const tx = await tokenClient.methods
      .transferChecked(new BN(amount), decimals)
      .accounts({
        source: sourceAta,
        mint,
        destination: destinationAta,
        authority: this.publicKey,
      })
      .transaction();
    tx.feePayer = this.publicKey;
    tx.recentBlockhash = recentBlockhash;
    const signedTx = this.signTransaction(tx);
    const rawTx = signedTx.serialize();
    console.log("raw tx", rawTx);
    /*
    return await client.provider.connection.sendRawTransaction(rawTx, {
      skipPreflight: false,
      preflightCommitment: "processed",
    });
		*/
    return "todo";
  }

  async transferSol(
    ctx: SolanaWalletContext,
    req: TransferSolRequest
  ): Promise<string> {
    return "todo";
  }

  signTransaction(tx: Transaction): Transaction {
    console.log("tim eto sing", tx);
    // todo
    return tx;
  }
}

export type TransferTokenRequest = {
  // SOL address.
  destination: PublicKey;
  mint: PublicKey;
  amount: number;
};

export type TransferSolRequest = {
  // SOL address.
  source: string;
  // SOL address.
  destination: string;
  //
  amount: number;
};

export type SolanaWalletContext = {
  wallet: SolanaWallet;
  recentBlockhash: Blockhash;
  tokenClient: Program<SplToken>;
  registry: Map<string, TokenInfo>;
};
