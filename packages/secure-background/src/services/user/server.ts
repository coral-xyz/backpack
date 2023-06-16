import type { KeyringStore, UserPublicKeys } from "../../store/keyring";
import type { SecureStore } from "../../store/SecureStore";
import type { SecureEvent } from "../../types/events";
import { KeyringStoreState } from "../../types/keyring";
import type {
  TransportHandler,
  TransportHandlers,
  TransportReceiver,
  TransportRemoveListener,
  TransportSender,
} from "../../types/transports";
import { SecureUIClient } from "../secureUI/client";

import type { SECURE_USER_EVENTS } from "./events";

export class UserService {
  public destroy: TransportRemoveListener;
  private secureUIClient: SecureUIClient;
  private keyringStore: KeyringStore;
  private secureStore: SecureStore;

  constructor(interfaces: {
    secureServer: TransportReceiver<SECURE_USER_EVENTS>;
    keyringStore: KeyringStore;
    secureStore: SecureStore;
    secureUIClient: TransportSender<SECURE_USER_EVENTS, "confirmation">;
  }) {
    this.keyringStore = interfaces.keyringStore;
    this.secureStore = interfaces.secureStore;
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
    };

    const handler = handlers[request.name]?.bind(this);
    return handler && handler(request);
  };

  private handleUserGet: TransportHandler<"SECURE_USER_GET"> = async ({
    request,
    event,
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

        response = { ...response, publicKeys, activePubkeys };
      }

      console.log("PCA", response);
      return respond(response);
    } catch (e) {
      console.error("PCA", e);
      return error(e);
    }
  };

  private handleUnlockKeyring: TransportHandler<"SECURE_USER_UNLOCK_KEYRING"> =
    async (event) => {
      const uuid =
        event.request.uuid ?? this.keyringStore.activeUserKeyring?.uuid;
      const keyringState = await this.keyringStore.state();

      if (
        keyringState === KeyringStoreState.Locked &&
        event.request.password &&
        uuid
      ) {
        return this.keyringStore
          .tryUnlock({
            password: event.request.password,
            uuid: uuid,
          })
          .then(() => event.respond({ unlocked: true }))
          .catch((e) => event.error(e));
      } else if (keyringState === KeyringStoreState.Unlocked) {
        return event.respond({ unlocked: true });
      }
      return event.respond({ unlocked: false });
    };
}
