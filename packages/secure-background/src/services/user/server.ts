import type { Blockchain, Preferences } from "@coral-xyz/common";

import { NotificationsClient } from "../../background-clients/NotificationsClient";
import { safeClientResponse } from "../../background-clients/safeClientResponse";
import { SecureUIClient } from "../../background-clients/SecureUIClient";
import type { SecureEvent } from "../../events";
import type { KeyringStore } from "../../store/KeyringStore/KeyringStore";
import type { SecureStore } from "../../store/SecureStore";
import { KeyringStoreState } from "../../types/keyring";
import type {
  TransportBroadcaster,
  TransportHandler,
  TransportReceiver,
  TransportRemoveListener,
  TransportResponder,
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
    secureUIClient: TransportSender<SECURE_USER_EVENTS, "ui">;
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
    switch (request.name) {
      case "SECURE_USER_UNLOCK_KEYRING":
        return this.handleUnlockKeyring(
          request as TransportResponder<typeof request.name>
        );
      case "SECURE_USER_GET_MNEMONIC":
        return this.handleGetMnemonic(
          request as TransportResponder<typeof request.name>
        );
      case "SECURE_USER_UPDATE":
        return this.handleUserUpdate(
          request as TransportResponder<typeof request.name>
        );
      case "SECURE_USER_CHECK_PASSWORD":
        return this.handleCheckPassword(
          request as TransportResponder<typeof request.name>
        );
      case "SECURE_USER_UPDATE_PREFERENCES":
        return this.handleUserUpdatePreferences(
          request as TransportResponder<typeof request.name>
        );
      case "SECURE_USER_SET_ACTIVE":
        return this.handleSetActive(
          request as TransportResponder<typeof request.name>
        );
      case "SECURE_USER_SET_WALLET":
        return this.handleSetWallet(
          request as TransportResponder<typeof request.name>
        );
      case "SECURE_USER_GET":
        return this.handleUserGet(
          request as TransportResponder<typeof request.name>
        );
      case "SECURE_USER_GET_ALL":
        return this.handleGetAllUsers(
          request as TransportResponder<typeof request.name>
        );
      case "SECURE_USER_GET_ALL_WITH_ACCOUNTS":
        return this.handleGetAllUsersWithAccounts(
          request as TransportResponder<typeof request.name>
        );
      case "SECURE_USER_EXPORT_BACKUP":
        return this.handleExportBackup(
          request as TransportResponder<typeof request.name>
        );
      case "SECURE_USER_IMPORT_BACKUP":
        return this.handleImportBackup(
          request as TransportResponder<typeof request.name>
        );
      case "SECURE_USER_GET_KEYRING_STATE":
        return this.handleUserGetKeyringState(
          request as TransportResponder<typeof request.name>
        );
      case "SECURE_USER_RESET_BACKPACK":
        return this.handleResetBackpack(
          request as TransportResponder<typeof request.name>
        );
      case "SECURE_USER_APPROVE_ORIGIN":
        return this.handleApproveOrigin(
          request as TransportResponder<typeof request.name>
        );
      case "SECURE_USER_REMOVE_ORIGIN":
        return this.handleRemoveOrigin(
          request as TransportResponder<typeof request.name>
        );
      case "SECURE_USER_PING":
        return this.handlePing(
          request as TransportResponder<typeof request.name>
        );
      case "SECURE_USER_INIT_WALLET":
        return this.handleInitWallet(
          request as TransportResponder<typeof request.name>
        );
      default:
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const missingEventCase: never = request.name;
        return Promise.resolve();
    }
  };

  private getUser = async (
    uuid?: string
  ): Promise<SecureEvent<"SECURE_USER_GET">["response"] | null> => {
    const keyringStoreState = await this.keyringStore.state();

    if (keyringStoreState === KeyringStoreState.NeedsOnboarding) {
      return {
        keyringStoreState: KeyringStoreState.NeedsOnboarding,
      };
    }
    const userData = await this.secureStore.getUserData();
    const users = userData.users;
    const user = uuid
      ? users.find((user) => uuid === user.uuid)
      : userData.activeUser;

    if (!user) {
      return null;
    }

    const [preferences, publicKeys] = await Promise.all([
      this.secureStore.getWalletDataForUser(user.uuid),
      this.secureStore.getUserPublicKeys(user.uuid).catch(() => null),
    ]);

    const response: SecureEvent<"SECURE_USER_GET">["response"] = {
      keyringStoreState,
      user,
      allUsers: users,
      preferences,
      publicKeys,
    };

    return response;
  };

  private handleImportBackup: TransportHandler<"SECURE_USER_IMPORT_BACKUP"> =
    async ({ request, event, respond, error }) => {
      const itemsStr = Buffer.from(request.backup, "base64").toString("utf-8");
      const items = JSON.parse(itemsStr);
      // await this.secureStore.import(items)
      respond({
        imported: true,
      });
    };

  private handleInitWallet: TransportHandler<"SECURE_USER_INIT_WALLET"> =
    async ({ request, event, respond, error }) => {
      const keyringStoreState = await this.keyringStore.state();
      const userCount = this.keyringStore.userCount();
      const username = `Account ${userCount + 1}`;

      // if keyring store doesnt exist, create it.
      if (keyringStoreState === KeyringStoreState.NeedsOnboarding) {
        if (request.password) {
          await this.keyringStore.init(
            username,
            request.password,
            request.uuid
          );
        } else {
          return error(new Error("No Keyring Store Found"));
        }
      }
      const maybeUser = await this.getUser(request.uuid);

      // if user doesnt exist, create it.
      if (!maybeUser) {
        await this.keyringStore.usernameKeyringCreate(username, request.uuid);
      }

      const userKeyring = this.keyringStore.getUserKeyring(request.uuid);

      const wallets: {
        publicKey: string;
        name: string;
        blockchain: Blockchain;
      }[] = [];
      for (let i = 0; i < request.blockchainWalletInits.length; i++) {
        wallets.push(
          await userKeyring.walletInit(request.blockchainWalletInits[i])
        );
      }

      await this.secureStore.setUserActivePublicKey(
        request.uuid,
        wallets[0].blockchain,
        wallets[0].publicKey
      );
      await this.notificationClient.userUpdated();

      respond({ wallets });
    };

  private handlePing: TransportHandler<"SECURE_USER_PING"> = async ({
    request,
    event,
    respond,
    error,
  }) => {
    const activeUser = await this.getUser();

    if (
      !activeUser ||
      activeUser.keyringStoreState === KeyringStoreState.NeedsOnboarding
    ) {
      return respond();
    }

    const preferences = await this.secureStore.getWalletDataForUser(
      activeUser.user.uuid
    );

    const autoLockSettings = { ...preferences.autoLockSettings };
    const now = Date.now();

    // update lastSeen in preferences if required
    if (request.unlockedUntil) {
      autoLockSettings.unlockedUntil = request.unlockedUntil;
      const newPreferences: Preferences = {
        ...preferences,
        autoLockSettings,
      };
      await this.secureStore.setWalletDataForUser(
        activeUser.user.uuid,
        newPreferences
      );
    }

    if (activeUser.keyringStoreState !== KeyringStoreState.Unlocked) {
      return respond();
    }

    // lock keyring if necessary
    const shouldLock =
      autoLockSettings.option !== "never" &&
      (autoLockSettings.unlockedUntil ?? 0) < now;

    if (shouldLock) {
      this.keyringStore.lock();
      this.notificationClient.userUpdated();
    }

    respond();
  };

  private handleExportBackup: TransportHandler<"SECURE_USER_EXPORT_BACKUP"> =
    async ({ request, event, respond, error }) => {
      const items = await this.secureStore.export();
      const itemsStr = JSON.stringify(items);
      const backup = Buffer.from(itemsStr, "utf-8").toString("base64");

      await this.secureUIClient.confirm(event, { backup });

      respond({
        exported: true,
      });
    };

  private handleGetMnemonic: TransportHandler<"SECURE_USER_GET_MNEMONIC"> =
    async ({ request, event, respond, error }) => {
      let password = request.password;

      if (!password || !(await this.keyringStore.checkPassword(password))) {
        const passwordResponse = await safeClientResponse(
          this.secureUIClient.confirm(event, {})
        );
        if (passwordResponse.password !== false) {
          password = passwordResponse.password;
        }
      }

      if (!password || !(await this.keyringStore.checkPassword(password))) {
        return error(new Error("Wrong Password"));
      }

      const keyringState = await this.keyringStore.state();
      if (keyringState !== KeyringStoreState.Unlocked) {
        const user = await this.secureStore.getActiveUser();
        await this.keyringStore.tryUnlock({
          password,
          uuid: user.uuid,
        });
      }
      const backup = this.keyringStore.exportKeyringStore();
      try {
        await this.secureUIClient.confirm(event, { backup });
      } catch {
        null;
      }

      return respond({ exported: true });
    };

  private handleCheckPassword: TransportHandler<"SECURE_USER_CHECK_PASSWORD"> =
    async ({ respond, request, error }) => {
      if (await this.keyringStore.checkPassword(request.password)) {
        return respond({
          valid: true,
        });
      } else {
        return error(new Error("Invalid Password"));
      }
    };

  private handleGetAllUsers: TransportHandler<"SECURE_USER_GET_ALL"> = async ({
    respond,
    error,
  }) => {
    const userData = await this.secureStore.getUserData();
    return respond({
      users: userData.users,
    });
  };

  private handleGetAllUsersWithAccounts: TransportHandler<"SECURE_USER_GET_ALL_WITH_ACCOUNTS"> =
    async ({ respond, error, event }) => {
      const origin = event.origin;
      const originUrl = new URL(event.origin.address).host;
      // only allow this method to be used by backpack.exchange externally
      if (
        ["browser", "xnft"].includes(origin.context) &&
        !originUrl.startsWith("localhost:") &&
        !(
          originUrl.endsWith(".backpack.exchange") ||
          originUrl === "backpack.exchange"
        ) &&
        !(originUrl.endsWith(".treklabs.xyz") || originUrl === "treklabs.xyz")
      ) {
        error(new Error("Access Denied."));
      }
      const currentUser = await this.getUser();

      if (
        !currentUser ||
        currentUser.keyringStoreState === KeyringStoreState.NeedsOnboarding
      ) {
        return error(new Error("Needs Onboarding."));
      }
      const userData = await this.secureStore.getUserData();

      Promise.all(
        userData.users.map(async (user) => {
          const publicKeys = await this.secureStore
            .getUserPublicKeys(user.uuid)
            .catch(() => null);

          if (!publicKeys) {
            return null;
          }

          return {
            username: user.username,
            uuid: user.uuid,
            publicKeys,
          };
        })
      )
        .then((users) => {
          respond({
            activeUser: currentUser.user.uuid,
            users: users.filter<NonNullable<(typeof users)[number]>>(
              (x): x is NonNullable<(typeof users)[number]> => Boolean(x)
            ),
          });
        })
        .catch((e) => {
          error(e);
        });
    };

  private handleUserGetKeyringState: TransportHandler<"SECURE_USER_GET_KEYRING_STATE"> =
    async ({ respond, error }) => {
      return respond({
        state: await this.keyringStore.state(),
      });
    };

  private handleUserUpdate: TransportHandler<"SECURE_USER_UPDATE"> = async ({
    request,
    respond,
    error,
  }) => {
    try {
      await this.secureStore.setUser(request.uuid, request);
      await this.notificationClient.userUpdated();
      return respond({ updated: true });
    } catch (e) {
      return error(e);
    }
  };

  private handleSetActive: TransportHandler<"SECURE_USER_SET_ACTIVE"> = async ({
    request,
    respond,
    error,
  }) => {
    try {
      const user = await this.secureStore.getActiveUser();
      if (user.uuid === request.uuid) {
        return respond({
          updated: true,
        });
      }
      await this.secureStore.switchActiveUser(request.uuid);
      await this.notificationClient.userUpdated();
      return respond({ updated: true });
    } catch (e) {
      return error(e);
    }
  };

  private handleSetWallet: TransportHandler<"SECURE_USER_SET_WALLET"> = async ({
    request,
    respond,
  }) => {
    const user = await this.secureStore.getActiveUser();
    await this.secureStore.setUserActivePublicKey(
      user.uuid,
      request.blockchain,
      request.publicKey
    );
    await this.notificationClient.userUpdated();
    return respond({ updated: true });
  };

  private handleUserGet: TransportHandler<"SECURE_USER_GET"> = async ({
    request,
    respond,
    error,
  }) => {
    try {
      const user = await this.getUser(request.uuid);

      if (!user) {
        return error(new Error("Unknown User"));
      }
      return respond(user);
    } catch (e) {
      return error(e);
    }
  };

  private handleResetBackpack: TransportHandler<"SECURE_USER_RESET_BACKPACK"> =
    async ({ event, respond, error }) => {
      await safeClientResponse(this.secureUIClient.confirm(event, {}));
      await this.keyringStore.reset();
      await this.notificationClient.userUpdated();
      return respond({
        reset: true,
      });
    };

  private handleUserUpdatePreferences: TransportHandler<"SECURE_USER_UPDATE_PREFERENCES"> =
    async ({ request, respond, error }) => {
      try {
        const preferences = await this.secureStore.getWalletDataForUser(
          request.uuid
        );
        if (!preferences) {
          return error(new Error("User preferences not found."));
        }
        const newPreferences: Preferences = {
          ...preferences,
          ...request.preferences,
        };
        await this.secureStore.setWalletDataForUser(
          request.uuid,
          newPreferences
        );
        await this.notificationClient.userUpdated();
        return respond({ updated: true });
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
        const publicKeys = await this.secureStore.getUserPublicKeys(
          activeUser.uuid
        );
        const publicKey =
          publicKeys?.platforms[request.blockchain]?.activePublicKey;

        if (
          preferences.approvedOrigins.includes(request.origin.address) &&
          publicKey
        ) {
          return respond({ approved: true, publicKey });
        }

        const approve = await this.secureUIClient.confirm(
          { ...event, origin: request.origin },
          {}
        );

        if (approve.error || !approve.response) {
          return error(approve.error!);
        }

        const newPreferences: Preferences = {
          ...preferences,
          approvedOrigins: [
            ...preferences.approvedOrigins,
            request.origin.address,
          ],
        };
        await this.secureStore.setWalletDataForUser(
          activeUser.uuid,
          newPreferences
        );
        await this.notificationClient.userUpdated();
        return respond({
          approved: true,
          publicKey: approve.response.publicKey,
        });
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

        const index = preferences.approvedOrigins.indexOf(
          request.origin.address
        );
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

        await this.notificationClient.userUpdated();
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
      const noEvent = event.event.uiOptions?.noEvent;

      if (!uuid) {
        const activeUser = await this.secureStore.getActiveUser();
        uuid = activeUser.uuid;
      }

      if (keyringState === KeyringStoreState.NeedsOnboarding) {
        return event.error(new Error("Needs Onboarding"));
      }

      // if keyring is unlocked but password was provided, lock keyring to verify password
      if (keyringState === KeyringStoreState.Unlocked && password) {
        this.keyringStore.lock();
        keyringState = KeyringStoreState.Locked;
      }

      // If keyring is not locked send response
      if (keyringState === KeyringStoreState.Unlocked) {
        return event.respond({ unlocked: true });
      }

      const uuidConst = uuid;
      const maybeUpdateAutolock = async () => {
        const preferences = await this.secureStore.getWalletDataForUser(
          uuidConst
        );
        const autoLockSettings = { ...preferences.autoLockSettings };
        if (autoLockSettings.seconds && !autoLockSettings.option) {
          const now = Date.now();
          await this.secureStore.setWalletDataForUser(uuidConst, {
            ...preferences,
            autoLockSettings: {
              ...preferences.autoLockSettings,
              unlockedUntil: now + autoLockSettings.seconds * 1000,
            },
          });
        }
      };

      // Keyring is locked, lets try to unlock it:
      // if we have a password lets go:
      if (password !== undefined) {
        return this.keyringStore
          .tryUnlock({ password, uuid })
          .then(async () => {
            await maybeUpdateAutolock();
            if (!noEvent) {
              await this.notificationClient.userUpdated();
            }
            return event.respond({ unlocked: true });
          })
          .catch((e: Error) => event.error(e));
      }

      // If we dont have a password we may ask the user to unlock.
      else if (!event.event.uiOptions?.noPopup) {
        const confirmation = await safeClientResponse(
          this.secureUIClient.confirm(event.event, event.event.uiOptions ?? {})
        );
        if (confirmation.unlocked) {
          await maybeUpdateAutolock();
          if (!noEvent) {
            await this.notificationClient.userUpdated();
          }
          return event.respond({ unlocked: true });
        }
      }
      return event.error(new Error("Unlock failed"));
    };
}
