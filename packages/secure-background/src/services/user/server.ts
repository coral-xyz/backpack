import { KeyringStoreStateEnum } from "@coral-xyz/recoil";

import type { KeyringStore } from "../../store/keyring";
import type {
  TransportHandler,
  TransportReceiver,
  TransportRemoveListener,
  TransportSender,
} from "../../types/transports";
import { SecureUIClient } from "../secureUI/client";

import type { SECURE_USER_EVENTS, SECURE_USER_UNLOCK_KEYRING } from "./events";

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

  private eventHandler: TransportHandler<SECURE_USER_EVENTS> = (request) => {
    switch (request.name) {
      case "SECURE_USER_UNLOCK_KEYRING":
        return this.handleUnlockKeyring(request);
    }
  };

  private handleUnlockKeyring: TransportHandler<SECURE_USER_UNLOCK_KEYRING> =
    async (request) => {
      const uuid =
        request.request.uuid ?? this.keyringStore.activeUserKeyring?.uuid;
      const keyringState = await this.keyringStore.state();

      if (
        keyringState === KeyringStoreStateEnum.Locked &&
        request.request.password &&
        uuid
      ) {
        return this.keyringStore
          .tryUnlock({
            password: request.request.password,
            uuid: uuid,
          })
          .then(() => {
            return {
              name: request.name,
              response: {
                unlocked: true,
              },
            };
          })
          .catch((e) => {
            return {
              name: request.name,
              error: e,
            };
          });
      } else if (keyringState === KeyringStoreStateEnum.Unlocked) {
        return {
          name: request.name,
          response: {
            unlocked: true,
          },
        };
      }
      return {
        name: request.name,
        response: {
          unlocked: false,
        },
      };
    };
}
