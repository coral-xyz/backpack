import { getLogger } from "@coral-xyz/common";
import {
  setKeyringStore,
  getKeyringCiphertext,
  KeyringStoreJson,
} from "../keyring";
import {
  setWalletDataForUser,
  getWalletData_DEPRECATED,
  setWalletData_DEPRECATED,
} from "../preferences";
import * as crypto from "../../keyring/crypto";

const logger = getLogger("migrations/0_2_0_510");

// Migration: 0.2.0-latest-beta-510.
//
// We make a best effort to migrate gracefully. This is neither atomic nor
// idempotent.
//
// In the event of failure, the user must re-onboard.
export async function migrate_0_2_0_510(
  uuid: string,
  username: string,
  password: string
) {
  await migrateWalletData_0_2_0_510(uuid, username);
  await migrateKeyringStore_0_2_0_510(uuid, username, password);
}

// Migration:
//
//  - moves the wallet data object to a user specfic location.
//  - clears out the old global wallet data object.
async function migrateWalletData_0_2_0_510(uuid: string, username: string) {
  const walletData = await getWalletData_DEPRECATED();

  if (!walletData) {
    logger.error("wallet data not found on disk");
    return;
  }

  // @ts-ignore
  if (walletData.username !== username) {
    logger.error("unexpected username");
    return;
  }

  // Write the username specific data.
  await setWalletDataForUser(uuid, walletData);

  // Clear the old data.
  // @ts-ignore
  await setWalletData_DEPRECATED(undefined);
}

// Migration:
//
//   - moves the keyring store from the older single user format to the new
//     multi user format.
export async function migrateKeyringStore_0_2_0_510(
  uuid: string,
  username: string,
  password: string
) {
  const ciphertextPayload = await getKeyringCiphertext();
  if (ciphertextPayload === undefined || ciphertextPayload === null) {
    logger.error("keyring store not found on disk");
    return;
  }

  const plaintext = await crypto.decrypt(ciphertextPayload, password);
  const oldJson = JSON.parse(plaintext);

  if (oldJson.username) {
    logger.error("keyring store already migrated");
    return;
  }

  const { mnemonic, blockchains, lastUsedTs } = oldJson;

  const newJson: KeyringStoreJson = {
    activeUserUuid: uuid,
    users: Object.fromEntries([
      [
        uuid,
        {
          uuid,
          username,
          mnemonic,
          blockchains,
        },
      ],
    ]),
    lastUsedTs,
  };

  await setKeyringStore(newJson, password);
}
