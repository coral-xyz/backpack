import type { Blockchain } from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  defaultPreferences,
  getLogger,
} from "@coral-xyz/common";

import * as crypto from "../../keyring/crypto";
import type { KeyringStoreJson } from "../keyring";
import { getKeyringCiphertext, setKeyringStore } from "../keyring";
import {
  getWalletData_DEPRECATED,
  setWalletData_DEPRECATED,
  setWalletDataForUser,
} from "../preferences";
import { getUserData, setUserData } from "../usernames";

const logger = getLogger("migrations/0_2_0_510");

// Migration: 0.2.0-latest-beta-510.
//
// We make a best effort to migrate gracefully. This is neither atomic nor
// idempotent.
//
// In the event of failure, the user must re-onboard.
export async function migrate_0_2_0_510(userInfo: {
  uuid: string;
  password: string;
}) {
  const username = await migrateWalletData_0_2_0_510(userInfo);
  await migrateUserData_0_2_0_510(userInfo, username);
  await migrateKeyringStore_0_2_0_510(userInfo, username);
}

// Migration:
//
//  - moves the wallet data object to a user specfic location.
//  - clears out the old global wallet data object.
async function migrateWalletData_0_2_0_510(userInfo: {
  uuid: string;
  password: string;
}): Promise<string> {
  const walletData = await getWalletData_DEPRECATED();

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
  await setWalletDataForUser(userInfo.uuid, {
    ...defaultPreferences(),
    ...walletData,
  });

  // Clear the old data.
  await setWalletData_DEPRECATED(undefined);

  return username;
}

// Migration:
//
// - creates the UserData storage field.
async function migrateUserData_0_2_0_510(
  userInfo: { uuid: string; password: string },
  username: string
) {
  let invariantViolation = false;
  try {
    await getUserData();
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
  await setUserData({
    activeUser,
    users: [activeUser],
  });
}

// Migration:
//
//   - moves the keyring store from the older single user format to the new
//     multi user format.
export async function migrateKeyringStore_0_2_0_510(
  userInfo: {
    uuid: string;
    password: string;
  },
  username: string
) {
  const { uuid, password } = userInfo;
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

  await setKeyringStore(newJson, password);
}
