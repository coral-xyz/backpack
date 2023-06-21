import type { Blockchain, Preferences } from "@coral-xyz/common";

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
import { SecureUIClient } from "../secureUI/client";

import type { SECURE_USER_EVENTS } from "./events";
type Blockchains = (typeof Blockchain)[keyof typeof Blockchain];
export class UserService {
  public destroy: TransportRemoveListener;
  private keyringStore: KeyringStore;
  private secureStore: SecureStore;
  private secureUIClient: SecureUIClient;
  private notificationBroadcaster: TransportBroadcaster;

  constructor(interfaces: {
    secureServer: TransportReceiver<SECURE_USER_EVENTS>;
    notificationBroadcaster: TransportBroadcaster;
    keyringStore: KeyringStore;
    secureStore: SecureStore;
    secureUIClient: TransportSender<SECURE_USER_EVENTS, "confirmation">;
  }) {
    this.keyringStore = interfaces.keyringStore;
    this.secureStore = interfaces.secureStore;
    this.notificationBroadcaster = interfaces.notificationBroadcaster;
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
    };

    const handler = handlers[request.name]?.bind(this);
    return handler && handler(request);
  };

  private handleUserGet: TransportHandler<"SECURE_USER_GET"> = async ({
    respond,
    error,
  }) => {
    try {
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
        const publicKeys =
          await this.keyringStore.activeUserKeyring.publicKeys();
        const activePubkeys = await this.keyringStore.activeWallets();

        const activePublicKeys: Partial<Record<Blockchain, string>> = {};
        activePubkeys.forEach((pubKey) => {
          const blockchain = Object.entries(publicKeys).find(
            ([_blockchain, keyrings]) => {
              return Object.values(keyrings).flat().includes(pubKey);
            }
          );
          if (blockchain) {
            activePublicKeys[blockchain[0]] = pubKey;
          }
        });
        response = { ...response, publicKeys, activePublicKeys };
      }

      console.log("PCA", response);
      return respond(response);
    } catch (e) {
      console.error("PCA", e);
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

  private handleUnlockKeyring: TransportHandler<"SECURE_USER_UNLOCK_KEYRING"> =
    async (event) => {
      console.log("PCA user server handleUnlockKeyring");
      let uuid = event.request.uuid;
      let password = event.request.password;
      let keyringState = await this.keyringStore.state();

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
      if (keyringState !== KeyringStoreState.Locked) {
        return event.respond({
          unlocked: keyringState === KeyringStoreState.Unlocked,
        });
      }

      // Keyring is locked, lets try to unlock it:
      // if we have a password lets go:
      if (password) {
        return this.keyringStore
          .tryUnlock({ password, uuid })
          .then(async () => {
            return event.respond({ unlocked: true });
          })
          .catch((e) => event.error("Wrong Password."));
      }

      // If we dont have a password ask the user to unlock.
      else {
        const confirmation = await this.secureUIClient.confirm(event.event);

        if (!confirmation.response) {
          return event.error(confirmation.error);
        }

        return event.respond({ unlocked: confirmation.response.unlocked });
      }
    };
}
