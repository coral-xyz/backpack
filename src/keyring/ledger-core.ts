import Transport from "@ledgerhq/hw-transport";
import { Transaction, PublicKey } from "@solana/web3.js";
import { DerivationPath } from "./crypto";
import * as bs58 from "bs58";

const INS_GET_PUBKEY = 0x05;
const INS_SIGN_MESSAGE = 0x06;

const P1_NON_CONFIRM = 0x00;
const P1_CONFIRM = 0x01;

const P2_EXTEND = 0x01;
const P2_MORE = 0x02;

const MAX_PAYLOAD = 255;

const LEDGER_CLA = 0xe0;

const BIP32_HARDENED_BIT = (1 << 31) >>> 0;

function _harden(n: number) {
  return (n | BIP32_HARDENED_BIT) >>> 0;
}

export function solanaDerivationPath(
  account: number,
  derivationPath: DerivationPath
): Buffer {
  const change = 0;
  derivationPath = derivationPath ? derivationPath : DerivationPath.bip44Change;

  if (derivationPath === DerivationPath.bip44Root) {
    const length = 2;
    const derivation = Buffer.alloc(1 + length * 4);
    let offset = 0;
    offset = derivation.writeUInt8(length, offset);
    offset = derivation.writeUInt32BE(_harden(44), offset); // Using BIP44
    derivation.writeUInt32BE(_harden(501), offset); // Solana's BIP44 path
    return derivation;
  } else if (derivationPath === DerivationPath.bip44) {
    const length = 3;
    const derivation = Buffer.alloc(1 + length * 4);
    let offset = 0;
    offset = derivation.writeUInt8(length, offset);
    offset = derivation.writeUInt32BE(_harden(44), offset); // Using BIP44
    offset = derivation.writeUInt32BE(_harden(501), offset); // Solana's BIP44 path
    derivation.writeUInt32BE(_harden(account), offset);
    return derivation;
  } else if (derivationPath === DerivationPath.bip44Change) {
    const length = 4;
    const derivation = Buffer.alloc(1 + length * 4);
    let offset = 0;
    offset = derivation.writeUInt8(length, offset);
    offset = derivation.writeUInt32BE(_harden(44), offset); // Using BIP44
    offset = derivation.writeUInt32BE(_harden(501), offset); // Solana's BIP44 path
    offset = derivation.writeUInt32BE(_harden(account), offset);
    derivation.writeUInt32BE(_harden(change), offset);
    return derivation;
  } else {
    throw new Error("Invalid derivation path");
  }
}

export async function solanaLedgerSignTransaction(
  transport: Transport,
  derivationPath: Buffer,
  transaction: Transaction
) {
  const msgBytes = transaction.serializeMessage();
  return solanaLedgerSignBytes(transport, derivationPath, msgBytes);
}

export async function solanaLedgerSignBytes(
  transport: Transport,
  derivationPath: Buffer,
  msgBytes: Buffer
) {
  var numPaths = Buffer.alloc(1);
  // @ts-ignore
  numPaths.writeUInt8(1);
  const payload = Buffer.concat([numPaths, derivationPath, msgBytes]);

  return solanaSend(transport, INS_SIGN_MESSAGE, P1_CONFIRM, payload);
}

export async function getPublicKey(
  transport: Transport,
  account: number,
  path: DerivationPath
) {
  let dPath = solanaDerivationPath(account, path);
  const pubkeyBytes = await solanaLedgerPubkey(transport, dPath);
  return new PublicKey(bs58.encode(pubkeyBytes));
}

async function solanaLedgerPubkey(
  transport: Transport,
  derivationPath: Buffer
) {
  return solanaSend(transport, INS_GET_PUBKEY, P1_NON_CONFIRM, derivationPath);
}

export async function solanaLedgerConfirmPublicKey(
  transport: Transport,
  derivationPath: Buffer
) {
  return await solanaSend(
    transport,
    INS_GET_PUBKEY,
    P1_CONFIRM,
    derivationPath
  );
}

/*
 * Helper for chunked send of large payloads
 */
async function solanaSend(
  transport: Transport,
  instruction: number,
  p1: number,
  payload: Buffer
) {
  var p2 = 0;
  var payload_offset = 0;

  if (payload.length > MAX_PAYLOAD) {
    while (payload.length - payload_offset > MAX_PAYLOAD) {
      const buf = payload.slice(payload_offset, payload_offset + MAX_PAYLOAD);
      payload_offset += MAX_PAYLOAD;
      console.log(
        "send",
        (p2 | P2_MORE).toString(16),
        buf.length.toString(16),
        buf
      );
      const reply = await transport.send(
        LEDGER_CLA,
        instruction,
        p1,
        p2 | P2_MORE,
        buf
      );
      if (reply.length !== 2) {
        throw new Error("received unexpected reply payload");
      }
      p2 |= P2_EXTEND;
    }
  }

  const buf = payload.slice(payload_offset);
  console.log("send", p2.toString(16), buf.length.toString(16), buf);
  const reply = await transport.send(LEDGER_CLA, instruction, p1, p2, buf);

  return reply.slice(0, reply.length - 2);
}
