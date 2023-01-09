import type {
  BackgroundClient} from "@coral-xyz/common";
import {
  confirmTransaction,
  UI_RPC_METHOD_SOLANA_SIGN_AND_SEND_TRANSACTION,
} from "@coral-xyz/common";
import type { AnchorProvider, Provider} from "@project-serum/anchor";
import { BN,Program } from "@project-serum/anchor";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import type {
  Connection,
  Transaction} from "@solana/web3.js";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import bs58 from "bs58";

import type { SecureTransfer } from "./types/SecureTransfer";
import IDL from "./IDL";

const SECURE_TRANSFER_PROGRAM_ID =
  "A1jvYLpetPZrMJksEM4RTmg8zZVQFT3WKv3K26S9yzqZ";

const findEscrowAddress = (sender, receiver, counter, program) =>
  findProgramAddressSync(
    [
      sender.toBuffer(),
      receiver.toBuffer(),
      counter.toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );

export const getOrSetupSecureTransferAcc = async (
  program: Program<SecureTransfer>,
  senderPublicKey: PublicKey,
  connection: Connection,
  backgroundClient: BackgroundClient
) => {
  let secureTransferState;
  const secureTransferAddress = findProgramAddressSync(
    [new PublicKey(senderPublicKey).toBuffer()],
    program.programId
  );
  try {
    secureTransferState = await program.account.secureTransfer.fetch(
      secureTransferAddress[0]
    );
  } catch (e) {
    console.error(e);
    const sendTx = await program.methods
      .setupSecureTransfer()
      .accounts({
        secureTransfer: secureTransferAddress[0],
        authority: new PublicKey(senderPublicKey),
        systemProgram: SystemProgram.programId,
      })
      .transaction();
    await sendAndConfirmTransaction(
      backgroundClient,
      connection,
      sendTx,
      senderPublicKey.toString()
    );
  }
  return secureTransferState?.counter || new BN(0);
};

export const createEscrow = async (
  provider: AnchorProvider,
  backgroundClient: BackgroundClient,
  connection: Connection,
  transferAmount: number,
  senderPublicKey: PublicKey,
  receiverPubkey: PublicKey
) => {
  const program = secureTransferProgram(provider);
  const counter = await getOrSetupSecureTransferAcc(
    program,
    senderPublicKey,
    connection,
    backgroundClient
  );
  const secureTransferAddress = findProgramAddressSync(
    [new PublicKey(senderPublicKey).toBuffer()],
    program.programId
  );

  const sendTx = await (
    await program.methods.send(
      receiverPubkey,
      new BN(transferAmount * LAMPORTS_PER_SOL),
      { twoWay: {} }
    )
  )
    .accounts({
      secureTransfer: secureTransferAddress[0],
      escrow: findEscrowAddress(
        new PublicKey(senderPublicKey),
        receiverPubkey,
        counter || new BN(0),
        program
      )[0],
    })
    .transaction();

  const x1 = await sendAndConfirmTransaction(
    backgroundClient,
    connection,
    sendTx,
    senderPublicKey.toString()
  );
  console.log(x1);
};

const sendAndConfirmTransaction = async (
  backgroundClient: BackgroundClient,
  connection: Connection,
  sendTx: Transaction,
  publicKey: string
) => {
  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  sendTx.recentBlockhash = blockhash;
  sendTx.feePayer = new PublicKey(publicKey);
  const signature = await backgroundClient.request({
    method: UI_RPC_METHOD_SOLANA_SIGN_AND_SEND_TRANSACTION,
    params: [
      bs58.encode(sendTx.serialize({ requireAllSignatures: false })),
      publicKey,
    ],
  });
  await confirmTransaction(connection, signature, "confirmed");
  return signature;
};

export function secureTransferProgram(
  provider: Provider
): Program<SecureTransfer> {
  return new Program<SecureTransfer>(
    <SecureTransfer>IDL,
    SECURE_TRANSFER_PROGRAM_ID,
    provider
  );
}
