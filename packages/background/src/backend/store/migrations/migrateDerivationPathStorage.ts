// Migration: 0.2.0-latest-beta-2408.
//
// We make a best effort to migrate gracefully. This is neither atomic nor
// idempotent.
//
// In the event of failure, the user must re-onboard.

import type { Blockchain } from "@coral-xyz/common";
import { BIP44Path } from "@coral-xyz/common";

export async function migrateDerivationPathStorage(json: any) {
  const jsonCopy = JSON.parse(JSON.stringify(json));

  for (const [user, userData] of Object.entries(json.users)) {
    for (const [blockchain, blockchainKeyring] of Object.entries(
      // @ts-ignore
      userData.blockchains
    )) {
      // Migrate hd keyring
      // @ts-ignore
      let hdKeyring = blockchainKeyring.hdKeyring;
      const derivationPaths = hdKeyring.accountIndices.map((i: number) => {
        if (hdKeyring.derivationPath === "bip44") {
          return new BIP44Path(
            // @ts-ignore
            BIP44Path.blockchainCoinType(blockchain as Blockchain),
            i === 0 ? undefined : i - 1
          ).toString();
        } else if (hdKeyring.derivationPath === "bip44change") {
          return new BIP44Path(
            BIP44Path.blockchainCoinType(blockchain as Blockchain),
            0 + BIP44Path.HARDENING,
            i === 0 ? undefined : i - 1
          ).toString();
        } else {
          // TODO sollet deprecated
          return "";
        }
      });
      json.users[user].blockchains[blockchain].hdKeyring = {
        derivationPaths,
        mnemonic: hdKeyring.mnemonic,
        seed: hdKeyring.seed,
      };

      // Migrate imported keyring

      // Migrate ledger keyring
    }
  }

  return jsonCopy;
}
