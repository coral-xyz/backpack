import type { Blockchain } from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  defaultPreferences,
  getLogger,
} from "@coral-xyz/common";

import type { KeyringStoreJson, SecureStore } from "../../SecureStore";
import type { SecretPayload } from "../crypto";
import { decrypt } from "../crypto";

const logger = getLogger("migrations/0_2_0_510");

// Migration: 0.2.0-latest-beta-510.
//
// We make a best effort to migrate gracefully. This is neither atomic nor
// idempotent.
//
// In the event of failure, the user must re-onboard.
export async function migrate_0_2_0_510(
  userInfo: {
    uuid: string;
    password: string;
  },
  store: SecureStore,
  unsafeGetKeyringCiphertext: () => Promise<SecretPayload>
) {
  const username = await migrateWalletData_0_2_0_510(userInfo, store);
  await migrateUserData_0_2_0_510(userInfo, username, store);
  await migrateKeyringStore_0_2_0_510(
    userInfo,
    username,
    store,
    unsafeGetKeyringCiphertext
  );
}

// Migration:
//
//  - moves the wallet data object to a user specfic location.
//  - clears out the old global wallet data object.
async function migrateWalletData_0_2_0_510(
  userInfo: {
    uuid: string;
    password: string;
  },
  store: SecureStore
): Promise<string> {
  const walletData = await store.getWalletData_DEPRECATED();

  if (!walletData) {
    logger.error("wallet data not found on disk");
    throw new Error("wallet data not found");
  }

  const username = walletData.username;
  if (!username) {
    logger.error("wallet username not found on disk");
    throw new Error("wallet data not found");
  }

  if (!userInfo.uuid) {
    const resp = await fetch(`${BACKEND_API_URL}/users/${username}`);
    const json = await resp.json();
    userInfo.uuid = json.id;
  }

  // Write the username specific data.
  await store.setWalletDataForUser(userInfo.uuid, {
    ...defaultPreferences(),
    ...walletData,
  });

  // Clear the old data.
  await store.setWalletData_DEPRECATED(undefined);

  return username;
}

// Migration:
//
// - creates the UserData storage field.
async function migrateUserData_0_2_0_510(
  userInfo: { uuid: string; password: string },
  username: string,
  store: SecureStore
) {
  let invariantViolation = false;
  try {
    await store.getUserData();
    invariantViolation = true;
  } catch {
    // expect err
  }

  if (invariantViolation) {
    throw new Error("getUserdata had unexpected data");
  }

  const activeUser = {
    username,
    uuid: userInfo.uuid,
    jwt: "",
  };
  await store.setUserData({
    activeUser,
    users: [activeUser],
  });
}

// Migration:
//
//   - moves the keyring store from the older single user format to the new
//     multi user format.
async function migrateKeyringStore_0_2_0_510(
  userInfo: {
    uuid: string;
    password: string;
  },
  username: string,
  store: SecureStore,
  unsafeGetKeyringCiphertext: () => Promise<SecretPayload>
) {
  const { uuid, password } = userInfo;
  const ciphertextPayload = await unsafeGetKeyringCiphertext();
  if (ciphertextPayload === undefined || ciphertextPayload === null) {
    logger.error("keyring store not found on disk");
    return;
  }

  const plaintext = await decrypt(ciphertextPayload, password);
  const oldJson = JSON.parse(plaintext);

  if (oldJson.username) {
    logger.error("keyring store already migrated");
    return;
  }

  const { mnemonic, blockchains, lastUsedTs } = oldJson;

  const newJson: KeyringStoreJson = {
    users: Object.fromEntries([
      [
        uuid,
        {
          uuid,
          username,
          mnemonic,
          activeBlockchain: Object.keys(blockchains)[0] as Blockchain,
          blockchains,
        },
      ],
    ]),
    lastUsedTs,
  };

  await store.setKeyringStore(newJson, password);
}
