import type { Blockchain } from "@coral-xyz/common";
import { BACKEND_API_URL, getLogger } from "@coral-xyz/common";

import { defaultPreferences } from "../../../blockchain-configs/preferences";
import type {
  KeyringStoreJson,
  MigrationPrivateStoreInterface,
} from "../../SecureStore";
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
  storeInterface: MigrationPrivateStoreInterface
) {
  const username = await migrateWalletData_0_2_0_510(userInfo, storeInterface);
  await migrateUserData_0_2_0_510(userInfo, username, storeInterface);
  await migrateKeyringStore_0_2_0_510(userInfo, username, storeInterface);
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
  storeInterface: MigrationPrivateStoreInterface
): Promise<string> {
  const walletData = await storeInterface.getWalletData_DEPRECATED();

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
  await storeInterface.store.setWalletDataForUser(userInfo.uuid, {
    ...defaultPreferences(),
    ...walletData,
  });

  // Clear the old data.
  await storeInterface.setWalletData_DEPRECATED(undefined);

  return username;
}

// Migration:
//
// - creates the UserData storage field.
async function migrateUserData_0_2_0_510(
  userInfo: { uuid: string; password: string },
  username: string,
  storeInterface: MigrationPrivateStoreInterface
) {
  let invariantViolation = false;

  try {
    await storeInterface.store.getUserData();

    invariantViolation = true;
  } catch {
    // expect err
  }

  if (invariantViolation) {
    throw new Error("getUserdata had unexpected data");
  }

  const currentKeyringStore = await storeInterface.getKeyringStore_NO_MIGRATION(
    userInfo.password
  );
  const userKeyring = currentKeyringStore?.users?.[userInfo.uuid];

  const activeUser = {
    username,
    uuid: userInfo.uuid,
    jwt: "",
    hasMnemonic: !!userKeyring?.mnemonic,
  };
  await storeInterface.store.setUserData({
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
  storeInterface: MigrationPrivateStoreInterface
) {
  const { uuid, password } = userInfo;
  const ciphertextPayload = await storeInterface.getKeyringCiphertext();
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
          blockchains,
        },
      ],
    ]),
    lastUsedTs,
  };

  await storeInterface.store.setKeyringStore(newJson, password);
}
