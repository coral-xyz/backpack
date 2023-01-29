// Migration: 0.2.0-latest-beta-2408.
//
// We make a best effort to migrate gracefully. This is neither atomic nor
// idempotent.
//
// In the event of failure, the user must re-onboard.

import type { Blockchain } from "@coral-xyz/common";
import { BIP44Path } from "@coral-xyz/common";

export async function migrate_0_2_0_2408(json: any) {
  for (const [user, userData] of Object.entries(json.users)) {
    for (const [blockchain, blockchainKeyring] of Object.entries(
      // @ts-ignore
      userData.blockchains
    )) {
      // Migrate hd keyring
      // Remaps old style DerivationPath and accountIndices to a flat array
      // of derivation paths
      // @ts-ignore
      let hdKeyring = blockchainKeyring.hdKeyring;
      const derivationPaths = hdKeyring.accountIndices.map((i: number) => {
        if (hdKeyring.derivationPath === "bip44") {
          return bip44Indexed(blockchain as Blockchain, i);
        } else if (hdKeyring.derivationPath === "bip44change") {
          return bip44ChangeIndexed(blockchain as Blockchain, i);
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

      // Migrate ledger keyring
      // @ts-ignore
      let ledgerKeyring = blockchainKeyring.ledgerKeyring;
      const publicKeyPaths = ledgerKeyring.derivationPaths.map(
        (d: { path: string; account: number; publicKey: string }) => {
          let derivationPath: string;
          if (d.path === "bip44") {
            derivationPath = bip44Indexed(blockchain as Blockchain, d.account);
          } else if (d.path === "bip44change") {
            derivationPath = bip44ChangeIndexed(
              blockchain as Blockchain,
              d.account
            );
          } else {
            // TODO sollet deprecated
            derivationPath = "";
          }
          return {
            derivationPath,
            publicKey: d.publicKey,
          };
        }
      );
      json.users[user].blockchains[blockchain].ledgerKeyring = {
        publicKeyPaths,
      };
    }
  }
}

const bip44Indexed = (blockchain: Blockchain, index: number) => {
  return new BIP44Path(
    // @ts-ignore
    BIP44Path.blockchainCoinType(blockchain as Blockchain),
    index === 0 ? undefined : index - 1
  ).toString();
};

const bip44ChangeIndexed = (blockchain: Blockchain, index: number) => {
  return new BIP44Path(
    BIP44Path.blockchainCoinType(blockchain as Blockchain),
    0 + BIP44Path.HARDENING,
    index === 0 ? undefined : index - 1
  ).toString();
};
