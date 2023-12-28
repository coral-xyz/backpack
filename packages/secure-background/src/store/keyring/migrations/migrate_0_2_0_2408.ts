// Migration: 0.2.0-latest-beta-2408.
//
// We make a best effort to migrate gracefully. This is not atomic.
//
// In the event of failure, the user must re-onboard.

import type { Blockchain } from "@coral-xyz/common";
import { getBlockchainConfig } from "@coral-xyz/secure-background/clients";

import {
  legacyBip44ChangeIndexed,
  legacyBip44Indexed,
  legacySolletIndexed,
  nextIndicesFromPaths,
} from "../../../keyring/derivationPaths";
import type { MigrationPrivateStoreInterface } from "../../SecureStore";

export async function migrate_0_2_0_2408(
  userInfo: {
    uuid: string;
    password: string;
  },
  storeInterface: MigrationPrivateStoreInterface
) {
  const { password } = userInfo;

  //
  // Get the current keyring store.
  //
  const json = await storeInterface.getKeyringStore_NO_MIGRATION(password);

  //
  // Update it to the new format.
  //
  for (const [user, userData] of Object.entries(json.users)) {
    for (const [blockchain, blockchainKeyring] of Object.entries(
      // @ts-ignore
      userData.blockchains
    )) {
      const bip44CoinType = getBlockchainConfig(
        blockchain as Blockchain
      ).bip44CoinType;

      // Migrate hd keyring
      // Remaps old style DerivationPath and accountIndices to a flat array
      // of derivation paths
      let hdKeyring = blockchainKeyring.hdKeyring as any;
      if (hdKeyring && hdKeyring.accountIndices !== undefined) {
        const derivationPaths = hdKeyring.accountIndices.map((i: number) => {
          if (hdKeyring.derivationPath === "bip44") {
            return legacyBip44Indexed(bip44CoinType, i);
          } else if (hdKeyring.derivationPath === "bip44-change") {
            return legacyBip44ChangeIndexed(bip44CoinType, i);
          } else {
            return legacySolletIndexed(i);
          }
        });
        const { walletIndex } = nextIndicesFromPaths(derivationPaths);
        json.users[user].blockchains[blockchain].hdKeyring = {
          mnemonic: hdKeyring.mnemonic,
          seed: hdKeyring.seed,
          derivationPaths,
          accountIndex: 0,
          walletIndex,
        };
      }

      // Migrate ledger keyring
      // @ts-ignore
      let ledgerKeyring = blockchainKeyring.ledgerKeyring as any;
      if (ledgerKeyring.derivationPaths !== undefined) {
        const walletDescriptors = ledgerKeyring.derivationPaths.map(
          (d: { path: string; account: number; publicKey: string }) => {
            let derivationPath: string;
            if (d.path === "bip44") {
              derivationPath = legacyBip44Indexed(bip44CoinType, d.account);
            } else if (d.path === "bip44-change") {
              derivationPath = legacyBip44ChangeIndexed(
                bip44CoinType,
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
  await storeInterface.store.setKeyringStore(json, password);
}
