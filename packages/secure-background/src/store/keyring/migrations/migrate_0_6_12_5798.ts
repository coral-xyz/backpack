import type { EclipseData } from "@coral-xyz/common";
import { Blockchain, BLOCKCHAIN_COMMON } from "@coral-xyz/common";

import type { MigrationPrivateStoreInterface } from "../../SecureStore";

export async function migrate_0_6_12_5798(
  userInfo: {
    uuid: string;
    password: string;
  },
  storeInterface: MigrationPrivateStoreInterface
) {
  //
  // Add eclipse to wallet data preferences.
  //
  const walletData = await storeInterface.store.getWalletDataForUser(
    userInfo.uuid
  );
  if (!walletData.eclipse) {
    walletData.eclipse = BLOCKCHAIN_COMMON[Blockchain.ECLIPSE]
      .PreferencesDefault as EclipseData;
  }

  await storeInterface.store.setWalletDataForUser(userInfo.uuid, walletData);
}
