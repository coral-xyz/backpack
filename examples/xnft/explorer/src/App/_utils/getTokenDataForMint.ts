import type { ProgramAccount } from "@project-serum/anchor";
import {
  ACCOUNT_SIZE,
  TOKEN_PROGRAM_ID,
  AccountLayout,
} from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";

/**
 * Fetches the xNFT token account public key and owner for the argued master mint.
 * @export
 * @param {Connection} connection
 * @param {PublicKey} masterMint
 * @returns {Promise<XnftTokenData>}
 */
export async function getTokenDataForMint(
  connection: Connection,
  masterMint: PublicKey
): Promise<XnftTokenData> {
  const tokenAccs = await connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
    filters: [
      {
        dataSize: ACCOUNT_SIZE,
      },
      {
        memcmp: {
          offset: 0,
          bytes: masterMint.toBase58(),
        },
      },
    ],
  });

  if (tokenAccs.length === 0) {
    throw new Error(
      `no token accounts found for mint ${masterMint.toBase58()}`
    );
  }

  const data = AccountLayout.decode(tokenAccs[0].account.data);

  return {
    owner: data.owner,
    publicKey: tokenAccs[0].pubkey,
  };
}
