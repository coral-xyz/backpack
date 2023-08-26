import {
  type Blockchain,
  NOTIFICATION_KEYRING_STORE_UNLOCKED,
  type Preferences,
} from "@coral-xyz/common";

import { NotificationsClient } from "../../background-clients/NotificationsClient";
import { SecureUIClient } from "../../background-clients/SecureUIClient";
import type { KeyringStore } from "../../store/keyring";
import type { SecureStore } from "../../store/SecureStore";
import type { SecureEvent } from "../../types/events";
import { KeyringStoreState } from "../../types/keyring";
import type {
  TransportBroadcaster,
  TransportHandler,
  TransportHandlers,
  TransportReceiver,
  TransportRemoveListener,
  TransportSender,
} from "../../types/transports";

import type { SECURE_USER_EVENTS } from "./events";

export class UserService {
  public destroy: TransportRemoveListener;
  private keyringStore: KeyringStore;
  private secureStore: SecureStore;
  private secureUIClient: SecureUIClient;
  private notificationClient: NotificationsClient;

  constructor(interfaces: {
    secureServer: TransportReceiver<SECURE_USER_EVENTS>;
    secureUIClient: TransportSender<SECURE_USER_EVENTS, "uiResponse">;
    notificationBroadcaster: TransportBroadcaster;
    keyringStore: KeyringStore;
    secureStore: SecureStore;
  }) {
    this.keyringStore = interfaces.keyringStore;
    this.secureStore = interfaces.secureStore;
    this.notificationClient = new NotificationsClient(
      interfaces.notificationBroadcaster
    );
    this.secureUIClient = new SecureUIClient(interfaces.secureUIClient);
    this.destroy = interfaces.secureServer.setHandler(
      this.eventHandler.bind(this)
    );
  }

  private eventHandler: TransportHandler<SECURE_USER_EVENTS> = async (
    request
  ) => {
    const handlers: TransportHandlers<SECURE_USER_EVENTS> = {
      SECURE_USER_UNLOCK_KEYRING: this.handleUnlockKeyring,
      SECURE_USER_GET: this.handleUserGet,
      SECURE_USER_APPROVE_ORIGIN: this.handleApproveOrigin,
      SECURE_USER_REMOVE_ORIGIN: this.handleRemoveOrigin,
    };

    const handler = handlers[request.name]?.bind(this);
    return handler && handler(request);
  };

  private getUser = async (): Promise<
    SecureEvent<"SECURE_USER_GET">["response"]
  > => {
    let response: SecureEvent<"SECURE_USER_GET">["response"] = {
      keyringState: await this.keyringStore.state(),
    };

    try {
      const activeUser = await this.secureStore.getActiveUser();
      const preferences = await this.secureStore.getWalletDataForUser(
        activeUser.uuid
      );
      response.user = { ...activeUser, preferences };
    } catch (_e) {
      null;
    }

    if (
      response.keyringState === "unlocked" &&
      this.keyringStore.activeUserKeyring
    ) {
      const publicKeys = await this.keyringStore.activeUserKeyring.publicKeys();
      const activePubkeys = await this.keyringStore.activeWallets();
      const activePublicKeys: Partial<Record<Blockchain, string>> =
        Object.fromEntries(
          activePubkeys.map((publicKey) => {
            return [
              this.keyringStore.activeUserKeyring.blockchainForPublicKey(
                publicKey
              ),
              publicKey,
            ];
          })
        );
      response = { ...response, publicKeys, activePublicKeys };
    }
    return response;
  };

  private handleUserGet: TransportHandler<"SECURE_USER_GET"> = async ({
    respond,
    error,
  }) => {
    try {
      const user = await this.getUser();
      return respond(user);
    } catch (e) {
      return error(e);
    }
  };

  private handleApproveOrigin: TransportHandler<"SECURE_USER_APPROVE_ORIGIN"> =
    async ({ event, request, respond, error }) => {
      try {
        const activeUser = await this.secureStore.getActiveUser();
        const preferences = await this.secureStore.getWalletDataForUser(
          activeUser.uuid
        );

        if (preferences.approvedOrigins.includes(request.origin)) {
          return respond({ approved: true });
        }

        const approve = await this.secureUIClient.confirm(event);

        if (!approve.response) {
          return error(approve.error);
        }

        const newPreferences: Preferences = {
          ...preferences,
          approvedOrigins: [...preferences.approvedOrigins, request.origin],
        };
        await this.secureStore.setWalletDataForUser(
          activeUser.uuid,
          newPreferences
        );

        return respond({ approved: true });
      } catch (e) {
        return error(e);
      }
    };

  private handleRemoveOrigin: TransportHandler<"SECURE_USER_REMOVE_ORIGIN"> =
    async ({ event, request, respond, error }) => {
      try {
        const activeUser = await this.secureStore.getActiveUser();
        const preferences = await this.secureStore.getWalletDataForUser(
          activeUser.uuid
        );

        const index = preferences.approvedOrigins.indexOf(request.origin);
        if (index < 0) {
          return respond({ removed: true });
        }

        const approvedOrigins = [...preferences.approvedOrigins];

        // remove origin
        approvedOrigins.splice(index, 1);

        const newPreferences: Preferences = {
          ...preferences,
          approvedOrigins,
        };
        await this.secureStore.setWalletDataForUser(
          activeUser.uuid,
          newPreferences
        );

        return respond({ removed: true });
      } catch (e) {
        return error(e);
      }
    };

  private handleUnlockKeyring: TransportHandler<"SECURE_USER_UNLOCK_KEYRING"> =
    async (event) => {
      let uuid = event.request.uuid;
      let password = event.request.password;
      let keyringState = await this.keyringStore.state();

      const handleUnlocked = async () => {
        try {
          const user = await this.getUser();
          if (!user.user || !user.activePublicKeys) {
            return event.error("No user found.");
          }
          await this.notificationClient.keyringUnlocked({
            activeUser: {
              jwt: user.user.jwt,
              username: user.user.username,
              uuid: user.user.uuid,
            },
            blockchainActiveWallets: user.activePublicKeys,
            ethereumConnectionUrl: user.user.preferences.ethereum.connectionUrl,
            ethereumChainId: user.user.preferences.ethereum.chainId,
            solanaConnectionUrl: user.user.preferences.solana.cluster,
            solanaCommitment: user.user.preferences.solana.commitment,
          });
        } catch (e) {
          return event.error(e);
        }
        return event.respond({ unlocked: true });
      };

      if (!uuid) {
        const activeUser = await this.secureStore.getActiveUser();
        uuid = activeUser.uuid;
      }

      if (keyringState === KeyringStoreState.NeedsOnboarding) {
        return event.error("Needs Onboarding");
      }

      // if keyring is unlocked but password was provided, lock keyring to verify password
      if (keyringState === KeyringStoreState.Unlocked && password) {
        this.keyringStore.lock();
        keyringState = KeyringStoreState.Locked;
      }

      // If keyring is not locked send response
      if (keyringState === KeyringStoreState.Unlocked) {
        return handleUnlocked();
      }

      // Keyring is locked, lets try to unlock it:
      // if we have a password lets go:
      if (password) {
        return this.keyringStore
          .tryUnlock({ password, uuid })
          .then(async () => {
            return handleUnlocked();
          })
          .catch((e) => event.error("Wrong Password."));
      }

      // If we dont have a password ask the user to unlock.
      else {
        const confirmation = await this.secureUIClient.confirm(event.event);

        if (!confirmation.response?.unlocked) {
          return event.error(confirmation.error);
        }

        return handleUnlocked();
      }
    };
}
