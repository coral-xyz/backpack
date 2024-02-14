import {
  Authorized,
  Keypair,
  Lockup,
  PublicKey,
  StakeProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

import type { SolanaClient } from "./SolanaClient";
import type { SolanaContext } from "./solanaLegacy";
import { SolanaProvider } from "./solanaLegacy";

export class SolanaStakeClient {
  constructor(private buildCtx: SolanaClient["buildCtx"]) {}

  /**
   * Atomically creates a Stake account, funds it with the specified amount
   * of `lamports`, then delegates it to the specified `validatorVoteAccount`.
   */
  async createAndDelegate(req: {
    authority: string;
    lamports: string;
    validatorVoteAccount: string;
  }) {
    return await Stake.createAndDelegate(await this.buildCtx(req.authority), {
      lamports: Number(req.lamports),
      validatorVoteAccount: new PublicKey(req.validatorVoteAccount),
    });
  }

  /**
   * Deactivates the provided `stakeAccount`, which should be in the
   * `active` or `activating` state.
   */
  async deactivate(req: { authority: string; stakeAccount: string }) {
    return await Stake.deactivate(await this.buildCtx(req.authority), {
      stakeAccount: new PublicKey(req.stakeAccount),
    });
  }

  /**
   * Merges stakeAccountToClose into stakeAccountToMergeInto.
   */
  async merge(req: {
    authority: string;
    stakeAccountToMergeInto: string;
    stakeAccountToClose: string;
  }) {
    return await Stake.merge(await this.buildCtx(req.authority), {
      stakeAccountToMergeInto: new PublicKey(req.stakeAccountToMergeInto),
      stakeAccountToClose: new PublicKey(req.stakeAccountToClose),
    });
  }

  /**
   * Withdraws all SOL from the provided `stakeAccount`, which should be
   * in the `inactive` state.
   */
  async withdraw(req: { authority: string; stakeAccount: string }) {
    return await Stake.withdraw(await this.buildCtx(req.authority), {
      stakeAccount: new PublicKey(req.stakeAccount),
    });
  }
}

const Stake = {
  async createAndDelegate(
    ctx: SolanaContext,
    req: {
      lamports: number;
      validatorVoteAccount: PublicKey;
    }
  ): Promise<string> {
    const { walletPublicKey, connection, commitment, blockhash } = ctx;
    const { validatorVoteAccount, lamports } = req;

    const stakeAccount = Keypair.generate();
    const tx = new Transaction();

    tx.add(
      StakeProgram.createAccount({
        authorized: new Authorized(walletPublicKey, walletPublicKey),
        lockup: new Lockup(0, 0, walletPublicKey),
        fromPubkey: walletPublicKey,
        lamports,
        stakePubkey: stakeAccount.publicKey,
      })
    );

    // XXX: There's a .toJSON() error with StakeProgram.delegate().instructions
    //      which causes wrapping it in tx.add() to fail. This is a workaround.
    StakeProgram.delegate({
      stakePubkey: stakeAccount.publicKey,
      authorizedPubkey: walletPublicKey,
      votePubkey: validatorVoteAccount,
    }).instructions.forEach((ix) => {
      tx.add(new TransactionInstruction(ix));
    });

    tx.feePayer = walletPublicKey;
    tx.recentBlockhash =
      blockhash ?? (await connection.getLatestBlockhash(commitment)).blockhash;

    tx.sign(stakeAccount);

    const signedTx = await SolanaProvider.signTransaction(ctx, tx, {
      type: "ANY",
      // amount: formatUnits(lamports ?? 1, 0),
      // validator: String(validatorVoteAccount),
    });

    return await connection.sendRawTransaction(signedTx.serialize());
  },

  async deactivate(
    ctx: SolanaContext,
    req: {
      stakeAccount: PublicKey;
    }
  ): Promise<string> {
    const { walletPublicKey, connection, commitment, blockhash } = ctx;
    const tx = StakeProgram.deactivate({
      stakePubkey: req.stakeAccount,
      authorizedPubkey: walletPublicKey,
    });
    tx.feePayer = walletPublicKey;
    tx.recentBlockhash =
      blockhash ?? (await connection.getLatestBlockhash(commitment)).blockhash;
    const signedTx = await SolanaProvider.signTransaction(ctx, tx, {
      type: "ANY",
    });
    return await connection.sendRawTransaction(signedTx.serialize());
  },

  async merge(
    ctx: SolanaContext,
    req: {
      stakeAccountToMergeInto: PublicKey;
      stakeAccountToClose: PublicKey;
    }
  ) {
    const { walletPublicKey, connection, commitment, blockhash } = ctx;
    const tx = StakeProgram.merge({
      stakePubkey: req.stakeAccountToMergeInto,
      sourceStakePubKey: req.stakeAccountToClose,
      authorizedPubkey: walletPublicKey,
    });
    tx.feePayer = walletPublicKey;
    tx.recentBlockhash =
      blockhash ?? (await connection.getLatestBlockhash(commitment)).blockhash;
    const signedTx = await SolanaProvider.signTransaction(ctx, tx, {
      type: "ANY",
    });
    return await connection.sendRawTransaction(signedTx.serialize());
  },

  async withdraw(
    ctx: SolanaContext,
    req: {
      stakeAccount: PublicKey;
    }
  ): Promise<string> {
    const { walletPublicKey, connection, commitment, blockhash } = ctx;
    const tx = StakeProgram.withdraw({
      stakePubkey: req.stakeAccount,
      authorizedPubkey: walletPublicKey,
      toPubkey: walletPublicKey,
      lamports: await connection.getBalance(req.stakeAccount),
    });
    tx.feePayer =
      typeof walletPublicKey === "string"
        ? new PublicKey(walletPublicKey)
        : walletPublicKey;
    tx.recentBlockhash =
      blockhash ?? (await connection.getLatestBlockhash(commitment)).blockhash;
    const signedTx = await SolanaProvider.signTransaction(ctx, tx, {
      type: "ANY",
    });
    const sig = await connection.sendRawTransaction(signedTx.serialize());
    return sig;
  },
};
