// Migration: 0.2.0-latest-beta-2408.
//
// We make a best effort to migrate gracefully. This is not atomic.
//
// In the event of failure, the user must re-onboard.

import type { Blockchain } from "@coral-xyz/common";
import {
  legacyBip44ChangeIndexed,
  legacyBip44Indexed,
  legacySolletIndexed,
  nextIndicesFromPaths,
} from "@coral-xyz/common";

import { getKeyringStore_NO_MIGRATION, setKeyringStore } from "../keyring";

export async function migrate_0_2_0_2408(userInfo: {
  uuid: string;
  password: string;
}) {
  const { password } = userInfo;

  //
  // Get the current keyring store.
  //
  const json = await getKeyringStore_NO_MIGRATION(password);

  //
  // Update it to the new format.
  //
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
      if (hdKeyring && hdKeyring.accountIndices !== undefined) {
        const derivationPaths = hdKeyring.accountIndices.map((i: number) => {
          if (hdKeyring.derivationPath === "bip44") {
            return legacyBip44Indexed(blockchain as Blockchain, i);
          } else if (hdKeyring.derivationPath === "bip44-change") {
            return legacyBip44ChangeIndexed(blockchain as Blockchain, i);
          } else {
            return legacySolletIndexed(i);
          }
        });
        const { accountIndex, walletIndex } =
          nextIndicesFromPaths(derivationPaths);
        json.users[user].blockchains[blockchain].hdKeyring = {
          mnemonic: hdKeyring.mnemonic,
          seed: hdKeyring.seed,
          derivationPaths,
          accountIndex,
          walletIndex,
        };
      }

      // Migrate ledger keyring
      // @ts-ignore
      let ledgerKeyring = blockchainKeyring.ledgerKeyring;
      if (ledgerKeyring.derivationPaths !== undefined) {
        const walletDescriptors = ledgerKeyring.derivationPaths.map(
          (d: { path: string; account: number; publicKey: string }) => {
            let derivationPath: string;
            if (d.path === "bip44") {
              derivationPath = legacyBip44Indexed(
                blockchain as Blockchain,
                d.account
              );
            } else if (d.path === "bip44-change") {
              derivationPath = legacyBip44ChangeIndexed(
                blockchain as Blockchain,
                d.account
              );
            } else {
              derivationPath = legacySolletIndexed(d.account);
            }
            return {
              derivationPath,
              publicKey: d.publicKey,
            };
          }
        );
        json.users[user].blockchains[blockchain].ledgerKeyring = {
          walletDescriptors,
        };
      }
    }
  }

  //
  // Save the new format.
  //
  await setKeyringStore(json, password);
}
