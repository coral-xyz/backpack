import {
  type Blockchain,
  CHANNEL_PLUGIN_CONNECTION_BRIDGE,
  type Preferences,
} from "@coral-xyz/common";
import { mnemonicToSeedSync } from "bip39";
import nacl from "tweetnacl";

import { NotificationsClient } from "../../background-clients/NotificationsClient";
import { safeClientResponse } from "../../background-clients/safeClientResponse";
import { SecureUIClient } from "../../background-clients/SecureUIClient";
import { getBlockchainConfig } from "../../blockchain-configs/blockchains";
import type { SecureEvent } from "../../events";
import { keyringForBlockchain } from "../../keyring";
import type { KeyringStore } from "../../store/KeyringStore/KeyringStore";
import type { UserKeyring } from "../../store/KeyringStore/UserKeyring";
import type { SecureStore, UserKeyringJson } from "../../store/SecureStore";
import type { BlockchainWalletDescriptor } from "../../types/blockchain";
import {
  BlockchainWalletDescriptorType,
  BlockchainWalletInitType,
  BlockchainWalletPreviewType,
} from "../../types/blockchain";
import { KeyringStoreState } from "../../types/keyring";
import type {
  SecureRequest,
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
      case "SECURE_USER_LOCK_KEYRING":
        return this.handleLockKeyring(
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
      case "SECURE_USER_REMOVE":
        return this.handleUserRemove(
          request as TransportResponder<typeof request.name>
        );
      case "SECURE_USER_REMOVE_WALLET":
        return this.handleUserRemoveWallet(
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
      case "SECURE_USER_PREVIEW_WALLETS":
        return this.handlePreviewWallets(
          request as TransportResponder<typeof request.name>
        );
      default:
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const missingEventCase: never = request.name;
        return Promise.resolve();
    }
  };

  private handlePreviewWallets: TransportHandler<"SECURE_USER_PREVIEW_WALLETS"> =
    async ({ request, event, respond, error }) => {
      const keyringStoreState = await this.keyringStore.state();
      const userKeyring =
        keyringStoreState !== KeyringStoreState.NeedsOnboarding
          ? await this.keyringStore.activeUserKeyring()
          : null;

      const emptyBlockchainKeyring = keyringForBlockchain(
        request.blockchain,
        this.secureStore
      );
      await emptyBlockchainKeyring.initEmpty();

      switch (request.type) {
        case BlockchainWalletPreviewType.HARDWARE: {
          const ledgerResponse = await safeClientResponse(
            this.secureUIClient.confirm(event, {})
          );

          const walletDescriptors = ledgerResponse.walletDescriptors.map(
            (walletDescriptor) => {
              const descriptor: BlockchainWalletDescriptor = {
                type: BlockchainWalletDescriptorType.HARDWARE,
                device: "ledger",
                blockchain: request.blockchain,
                publicKey: walletDescriptor.publicKey,
                derivationPath: walletDescriptor.derivationPath,
                imported: !!userKeyring?.hasPublicKey(
                  request.blockchain,
                  walletDescriptor.publicKey
                ),
              };

              return descriptor;
            }
          );
          return respond({
            wallets: [
              {
                type: "SVM Standard Wallet",
                walletDescriptors: walletDescriptors,
              },
            ],
          });
        }
        case BlockchainWalletPreviewType.MNEMONIC: {
          let mnemonic = request.mnemonic;
          // if we're using the already existing mnemonic, get it.
          if (!mnemonic) {
            const keyring = await this.keyringStore.activeUserKeyring();
            mnemonic = keyring.exportMnemonic();
          }

          const seed = mnemonicToSeedSync(mnemonic);
          const wallets: {
            [type: string]: { publicKey: string; derivationPath: string }[];
          } = {};

          await Promise.all(
            request.derivationPaths.map(async (derivationPath) => {
              const privatKey = await emptyBlockchainKeyring.seedToSecretKey(
                seed,
                derivationPath
              );
              const publicKeys =
                await emptyBlockchainKeyring.secretKeyToPublicKeys(privatKey);

              publicKeys.forEach(({ type, publicKey }) => {
                wallets[type] ??= [];
                wallets[type].push({ publicKey, derivationPath });
              });
            })
          );

          return respond({
            wallets: Object.entries(wallets).map(([type, publicKeys]) => {
              return {
                type,
                walletDescriptors: publicKeys.map(
                  ({ publicKey, derivationPath }) => {
                    return {
                      type: BlockchainWalletDescriptorType.MNEMONIC,
                      blockchain: request.blockchain,
                      publicKey,
                      derivationPath,
                      imported: !!userKeyring?.hasPublicKey(
                        request.blockchain,
                        publicKey
                      ),
                    };
                  }
                ),
              };
            }),
          });
        }
        case BlockchainWalletPreviewType.MNEMONIC_NEXT: {
          let mnemonic = request.mnemonic;
          // if we're using the already existing mnemonic, get it.
          if (!mnemonic) {
            const keyring = await this.keyringStore.activeUserKeyring();
            mnemonic = keyring.exportMnemonic();
          }

          const seed = mnemonicToSeedSync(mnemonic);
          const blockchainConfig = getBlockchainConfig(request.blockchain);
          const derivationPathPattern =
            blockchainConfig.DerivationPathOptions[0].pattern;

          const wallets: {
            [type: string]: { publicKey: string; derivationPath: string };
          } = {};

          // eslint-disable-next-line no-constant-condition
          for (let i = 0; true; i++) {
            const derivationPath = derivationPathPattern.replace(/x/g, `${i}`);
            const privatKey = await emptyBlockchainKeyring.seedToSecretKey(
              seed,
              derivationPath
            );
            const publicKeys =
              await emptyBlockchainKeyring.secretKeyToPublicKeys(privatKey);

            let missingPublicKey = false;
            publicKeys.forEach(({ type, publicKey }) => {
              if (wallets[type]) {
                return;
              }
              if (!userKeyring?.hasPublicKey(request.blockchain, publicKey)) {
                wallets[type] = { publicKey, derivationPath };
              } else {
                missingPublicKey = true;
              }
            });

            if (!missingPublicKey) {
              return respond({
                wallets: Object.entries(wallets).map(
                  ([type, { publicKey, derivationPath }]) => {
                    return {
                      type,
                      walletDescriptors: [
                        {
                          type: BlockchainWalletDescriptorType.MNEMONIC,
                          blockchain: request.blockchain,
                          publicKey,
                          derivationPath,
                          imported: false,
                        },
                      ],
                    };
                  }
                ),
              });
            }
          }
        }
        case BlockchainWalletPreviewType.PRIVATEKEY: {
          const publicKeys = await emptyBlockchainKeyring.secretKeyToPublicKeys(
            request.privateKey
          );
          return respond({
            wallets: publicKeys.map(({ type, publicKey }) => {
              return {
                type,
                walletDescriptors: [
                  {
                    type: BlockchainWalletDescriptorType.PRIVATEKEY,
                    publicKey: publicKey,
                    blockchain: request.blockchain,
                    imported: !!userKeyring?.hasPublicKey(
                      request.blockchain,
                      publicKey
                    ),
                  },
                ],
              };
            }),
          });
        }
        default: {
          return error(new Error("Unhandled BlockchainWalletPreviewType"));
        }
      }
    };

  private getUser = async (
    uuid?: string
  ): Promise<SecureEvent<"SECURE_USER_GET">["response"] | null> => {
    let keyringStoreState = await this.keyringStore.state();

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

    const [preferences, publicKeys, sessionPassword] = await Promise.all([
      this.secureStore.getWalletDataForUser(user.uuid),
      this.secureStore.getUserPublicKeys(user.uuid).catch(() => null),
      this.secureStore.getSessionPassword(user.uuid),
    ]);

    // if we have a session password (autolock:unlocked) but keyring is locked -> unlock
    if (sessionPassword && keyringStoreState === KeyringStoreState.Locked) {
      try {
        await this.keyringStore.tryUnlock({
          password: sessionPassword,
          uuid: user.uuid,
        });
        keyringStoreState = KeyringStoreState.Unlocked;
      } catch {
        // wrong password? -> loggout
        await this.secureStore.removeSessionPassword();
      }
    }
    // if we dont have a session password (autolock:locked) but keyring unlocked -> lock
    else if (
      !sessionPassword &&
      keyringStoreState === KeyringStoreState.Unlocked
    ) {
      await this.keyringStore.persistAndLock();
      keyringStoreState = KeyringStoreState.Locked;
    }

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
    async ({ request, respond, error }) => {
      try {
        this.notificationClient.pause("handleInitWallet", true);

        const keyringStoreState = await this.keyringStore.state();
        const userCount = this.keyringStore.userCount();
        const username = request.accountName || `Account ${userCount + 1}`;

        // if keyring store doesnt exist, create it.
        if (keyringStoreState === KeyringStoreState.NeedsOnboarding) {
          if (request.password) {
            await this.keyringStore.init(request.password, request.uuid);
            await this.secureStore.setSessionPassword(request.password);
          } else {
            return error(new Error("No Keyring Store Found"));
          }
        }

        let userKeyring = this.keyringStore.getUserKeyring(request.uuid);

        // if user doesnt exist, create it.
        if (!userKeyring) {
          userKeyring = await this.keyringStore.usernameKeyringCreate(
            username,
            request.uuid
          );
        }

        // for each walletInit -> import wallet.
        const wallets: Awaited<ReturnType<UserKeyring["walletInit"]>>[] = [];
        for (let i = 0; i < request.blockchainWalletInits.length; i++) {
          wallets.push(
            await userKeyring.walletInit(request.blockchainWalletInits[i])
          );
        }

        // verify all imports where successfull
        await this.persistAndVerifyWalletInit(request);

        // set active user to new wallet.
        await Promise.all([
          this.secureStore.setUserActivePublicKey(
            request.uuid,
            wallets[0].blockchain,
            wallets[0].publicKey
          ),
          this.refreshAutolock(request.uuid),
        ]);

        // notify app
        this.notificationClient.resume("handleInitWallet");
        await this.notificationClient.userUpdated();

        respond({ wallets });
      } catch (e) {
        // on error we reset everything we did
        await this.resetWalletInit(request);

        // notify the app something might have changed
        this.notificationClient.resume("handleInitWallet");
        await this.notificationClient.userUpdated();

        // and throw the error
        throw e;
      }
    };

  private async resetWalletInit(
    request: SecureRequest<"SECURE_USER_INIT_WALLET">["request"]
  ) {
    try {
      // if we have a password we reset the complete keyring -> initial setup.
      if (request.password) {
        await this.keyringStore.reset();
        return;
      }

      const userKeyring = this.keyringStore.getUserKeyring(request.uuid);

      // if user keyring doesnt exist, we try removing user to clean out any remnants.
      if (!userKeyring) {
        await this.userRemove({ uuid: request.uuid });
        return;
      }

      // delete each wallet we were about to add.
      for (let i = 0; i < request.blockchainWalletInits.length; i++) {
        try {
          const wallet = request.blockchainWalletInits[i];
          const blockchainKeyring = userKeyring.keyringForBlockchain(
            wallet.blockchain
          );
          if (blockchainKeyring) {
            await this.keyringStore.keyDelete(
              request.uuid,
              wallet.blockchain,
              wallet.publicKey
            );
          }
        } catch (e) {
          // if a wallet fails, do nothing to make sure were cleaning up everything else
        }
      }

      // if there is still a keyring, persist our changes.
      const keyringStoreState = await this.keyringStore.state();
      if (keyringStoreState !== KeyringStoreState.NeedsOnboarding) {
        await this.keyringStore.persist();
      }
    } catch (e) {
      console.error("Import failed: Error resetting state.");
    }
  }

  private async persistAndVerifyWalletInit(
    request: SecureRequest<"SECURE_USER_INIT_WALLET">["request"]
  ): Promise<void> {
    // throws if error occurs.
    // Check keyring can be unlocked.
    if (request.password) {
      // if we have a password use it to unlock
      await this.keyringStore.persistAndLock();
      await this.keyringStore.tryUnlock({
        password: request.password,
        uuid: request.uuid,
      });
    } else {
      // without password reunlock with exising password.
      await this.keyringStore.persistAndReunlock({ uuid: request.uuid });
    }
    // Check UserKeyring is available.
    const userKeyring = this.keyringStore.getUserKeyring(request.uuid);
    if (!userKeyring) {
      throw new Error("Failed to import: Unable to create UserKeyring");
    }

    // for each initialized wallet
    await Promise.all(
      request.blockchainWalletInits.map(async (wallet) => {
        // check that keyring exists
        const blockchainKeyring = userKeyring.keyringForBlockchain(
          wallet.blockchain
        );
        // check blockchainKeyring has publicKey
        if (!blockchainKeyring.hasPublicKey(wallet.publicKey)) {
          throw new Error(
            `Failed to import ${wallet.publicKey} into BlockchainKeyring.`
          );
        }
        // if not a hardware wallet sign test message to verify.
        if (wallet.type !== BlockchainWalletInitType.HARDWARE) {
          const signature = await blockchainKeyring.signMessage(
            "verify",
            wallet.publicKey
          );
        }
      })
    );
  }

  private async userRemove({ uuid }: { uuid: string }) {
    const data = await this.secureStore.getUserData();

    // if this is the last user -> reset whole app
    if (data.users.length === 1) {
      await this.keyringStore.reset();
      return;
    }

    // If we have more users available, just remove the user.
    await this.keyringStore.removeUser(uuid);
    await this.keyringStore.persist();
    await this.notificationClient.userUpdated();
  }

  private handleUserRemove: TransportHandler<"SECURE_USER_REMOVE"> = async ({
    request,
    event,
    respond,
    error,
  }) => {
    await this.userRemove(request);
    return respond({ removed: true });
  };

  private handleUserRemoveWallet: TransportHandler<"SECURE_USER_REMOVE_WALLET"> =
    async ({ request, event, respond, error }) => {
      this.notificationClient.pause("handleUserRemoveWallet", true);
      await this.keyringStore.keyDelete(
        request.uuid,
        request.blockchain,
        request.publicKey
      );
      await this.keyringStore.persist();
      this.notificationClient.resume("handleUserRemoveWallet");
      await this.notificationClient.userUpdated();
      return respond({ removed: true });
    };

  private handlePing: TransportHandler<"SECURE_USER_PING"> = async ({
    request,
    event,
    respond,
    error,
  }) => {
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
    await this.secureStore.setUserActivePublicKey(
      request.uuid,
      request.blockchain,
      request.publicKey
    );
    await this.notificationClient.userUpdated();
    return respond({ updated: true });
  };

  private handleUserGet: TransportHandler<"SECURE_USER_GET"> = async ({
    event,
    request,
    respond,
    error,
  }) => {
    try {
      const user = await this.getUser(request.uuid);

      if (!user) {
        return error(new Error("Unknown User"));
      }

      // if we requested user from unlocked extension -> refresh autolock timer
      if (
        user.keyringStoreState === KeyringStoreState.Unlocked &&
        event.origin.context === "extension"
      ) {
        await this.refreshAutolock(user.user.uuid);
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
        await this.refreshAutolock(request.uuid);
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

  private handleLockKeyring: TransportHandler<"SECURE_USER_LOCK_KEYRING"> =
    async (event) => {
      await Promise.all([
        this.keyringStore.persistAndLock(),
        this.secureStore.setUnlockedUntil(0),
        this.secureStore.removeSessionPassword(),
      ]);
      await this.notificationClient.userUpdated();
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
        await this.keyringStore.persistAndLock();
        keyringState = KeyringStoreState.Locked;
      }

      // If keyring is not locked send response
      if (keyringState === KeyringStoreState.Unlocked) {
        return event.respond({ unlocked: true });
      }

      const uuidConst = uuid;
      const sessionPassword =
        await this.secureStore.getSessionPassword(uuidConst);
      const unlockPassword = password ?? sessionPassword;

      // Keyring is locked, lets try to unlock it:
      // if we have a password lets go:
      if (unlockPassword !== undefined) {
        const password = unlockPassword;
        return this.keyringStore
          .tryUnlock({ password, uuid })
          .then(async () => {
            await this.refreshAutolock(uuidConst);
            // update sessionPassword if necessary
            if (password !== sessionPassword) {
              await this.secureStore.setSessionPassword(password);
            }
            if (!noEvent) {
              await this.notificationClient.keyringUnlocked();
              await this.notificationClient.userUpdated();
            }
            return event.respond({ unlocked: true });
          })
          .catch((e: Error) => event.error(e));
      }

      // If we dont have a password we may ask the user to unlock via UI.
      else if (!event.event.uiOptions?.noPopup) {
        event.respond(
          await safeClientResponse(
            this.secureUIClient.confirm(
              event.event,
              event.event.uiOptions ?? {}
            )
          )
        );
      }
      return event.error(new Error("Unlock failed"));
    };

  private refreshAutolock = async (uuid: string) => {
    const now = Date.now();
    const preferences = await this.secureStore.getWalletDataForUser(uuid);
    const seconds = preferences.autoLockSettings.seconds ?? 600;
    const unlockUntil = now + seconds * 1000;
    return this.secureStore.setUnlockedUntil(unlockUntil);
  };
}
