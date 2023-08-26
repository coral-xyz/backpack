import type { Blockchain } from "@coral-xyz/common";
import { NOTIFICATION_KEYRING_STORE_UNLOCKED } from "@coral-xyz/common";

import type { TransportBroadcaster } from "../types/transports";

export class NotificationsClient {
  constructor(private client: TransportBroadcaster) {}

  public keyringUnlocked(data: {
    activeUser: {
      jwt: string;
      username: string;
      uuid: string;
    };
    blockchainActiveWallets: Partial<Record<Blockchain, string>>;
    ethereumConnectionUrl: string;
    ethereumChainId: string;
    solanaConnectionUrl: string;
    solanaCommitment: string;
  }): Promise<void> {
    return this.client.broadcast({
      name: NOTIFICATION_KEYRING_STORE_UNLOCKED,
      data,
    });
  }
}
