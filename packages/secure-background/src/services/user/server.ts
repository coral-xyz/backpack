import type { KeyringStore } from "../../store/keyring";
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

  constructor(interfaces: {
    secureServer: TransportReceiver<SECURE_USER_EVENTS>;
    keyringStore: KeyringStore;
    secureUIClient: TransportSender<SECURE_USER_EVENTS, "confirmation">;
  }) {
    this.keyringStore = interfaces.keyringStore;
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
    };

    const handler = handlers[request.name]?.bind(this);
    return handler && handler(request);
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
