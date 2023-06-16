import React, { useEffect } from "react";
import type {
  AutolockSettings,
  Blockchain,
  Notification,
} from "@coral-xyz/common";
import {
  BackgroundSolanaConnection,
  CHANNEL_POPUP_NOTIFICATIONS,
  ChannelAppUi,
  getLogger,
  NOTIFICATION_ACTIVE_BLOCKCHAIN_UPDATED,
  NOTIFICATION_AGGREGATE_WALLETS_UPDATED,
  NOTIFICATION_APPROVED_ORIGINS_UPDATE,
  NOTIFICATION_AUTO_LOCK_SETTINGS_UPDATED,
  NOTIFICATION_BLOCKCHAIN_KEYRING_CREATED,
  NOTIFICATION_BLOCKCHAIN_KEYRING_DELETED,
  NOTIFICATION_DARK_MODE_UPDATED,
  NOTIFICATION_DEVELOPER_MODE_UPDATED,
  NOTIFICATION_ETHEREUM_ACTIVE_WALLET_UPDATED,
  NOTIFICATION_ETHEREUM_CHAIN_ID_UPDATED,
  NOTIFICATION_ETHEREUM_CONNECTION_URL_UPDATED,
  NOTIFICATION_ETHEREUM_FEE_DATA_DID_UPDATE,
  NOTIFICATION_ETHEREUM_TOKENS_DID_UPDATE,
  NOTIFICATION_FEATURE_GATES_UPDATED,
  NOTIFICATION_KEY_IS_COLD_UPDATE,
  NOTIFICATION_KEYNAME_UPDATE,
  NOTIFICATION_KEYRING_DERIVED_WALLET,
  NOTIFICATION_KEYRING_IMPORTED_SECRET_KEY,
  NOTIFICATION_KEYRING_IMPORTED_WALLET,
  NOTIFICATION_KEYRING_KEY_DELETE,
  NOTIFICATION_KEYRING_SET_MNEMONIC,
  NOTIFICATION_KEYRING_STORE_ACTIVE_USER_UPDATED,
  NOTIFICATION_KEYRING_STORE_CREATED,
  NOTIFICATION_KEYRING_STORE_LOCKED,
  NOTIFICATION_KEYRING_STORE_REMOVED_USER,
  NOTIFICATION_KEYRING_STORE_RESET,
  NOTIFICATION_KEYRING_STORE_UNLOCKED,
  NOTIFICATION_KEYRING_STORE_USERNAME_ACCOUNT_CREATED,
  NOTIFICATION_NAVIGATION_URL_DID_CHANGE,
  NOTIFICATION_SOLANA_ACTIVE_WALLET_UPDATED,
  NOTIFICATION_SOLANA_COMMITMENT_UPDATED,
  NOTIFICATION_SOLANA_CONNECTION_URL_UPDATED,
  NOTIFICATION_SOLANA_EXPLORER_UPDATED,
  NOTIFICATION_SOLANA_SPL_TOKENS_DID_UPDATE,
  NOTIFICATION_USER_ACCOUNT_AUTHENTICATED,
  NOTIFICATION_USER_ACCOUNT_PUBLIC_KEY_CREATED,
  NOTIFICATION_USER_ACCOUNT_PUBLIC_KEY_DELETED,
  NOTIFICATION_USER_ACCOUNT_PUBLIC_KEYS_UPDATED,
  NOTIFICATION_XNFT_PREFERENCE_UPDATED,
} from "@coral-xyz/common";
import { KeyringStoreState } from "@coral-xyz/secure-background/types";
import type { Commitment } from "@solana/web3.js";
import { useRecoilState, useResetRecoilState, useSetRecoilState } from "recoil";

import * as atoms from "../atoms";
import { allPlugins } from "../hooks";
import type { WalletPublicKeys } from "../types";
import { useUpdateAllSplTokenAccounts, useUpdateEthereumBalances } from "../";

import { useNavigate } from "./useNavigatePolyfill";

const logger = getLogger("notifications-provider");

//
// The Notifications provider is used to subscribe and handle notifications
// from the background script. Among other things, this is useful to enforce
// a unidirectional data flow: app -> background script -> notifications.
//
export function NotificationsProvider(props: any) {
  const setWalletData = useSetRecoilState(atoms.walletPublicKeyData);
  const setWalletPublicKeysWithFn = (publicKeysFn) => {
    setWalletData((current) => {
      return {
        ...current,
        publicKeys: publicKeysFn(current.publicKeys),
      };
    });
  };
  const setServerPublicKeys = useSetRecoilState(atoms.serverPublicKeys);
  const setActiveBlockchain = (activeBlockchain: Blockchain) => {
    setWalletData((current) => {
      return {
        ...current,
        activeBlockchain,
      };
    });
  };
  const setActivePublicKeys = (activePublicKeys: string[]) => {
    setWalletData((current) => {
      return {
        ...current,
        activePublicKeys,
      };
    });
  };
  const setKeyringHasMnemonic = useSetRecoilState(atoms.keyringHasMnemonic);
  const setKeyringStoreState = useSetRecoilState(atoms.keyringStoreState);
  const setActiveUser = useSetRecoilState(atoms.user);
  const setAuthenticatedUser = useSetRecoilState(atoms.authenticatedUser);
  const resetAllUsers = useResetRecoilState(atoms.allUsers);

  // Preferences.
  const setPreferences = useSetRecoilState(atoms.preferences);
  // useRecoilState is required here because setFeatureGates requires the current
  // state of featureGates atom to update
  const [featureGates, setFeatureGates] = useRecoilState(atoms.featureGates);

  const setAutoLockSettings = (autoLockSettings: AutolockSettings) => {
    setPreferences((current) => {
      return {
        ...current,
        autoLockSettings,
      };
    });
  };
  const setIsDarkMode = (darkMode: boolean) => {
    setPreferences((current) => {
      return {
        ...current,
        darkMode,
      };
    });
  };
  const setIsDeveloperMode = (developerMode: boolean) => {
    setPreferences((current) => {
      return {
        ...current,
        developerMode,
      };
    });
  };
  const setIsAggregateWallets = (aggregateWallets: boolean) => {
    setPreferences((current) => {
      return {
        ...current,
        aggregateWallets,
      };
    });
  };
  const setApprovedOrigins = (approvedOrigins: string[]) => {
    setPreferences((current) => {
      return {
        ...current,
        approvedOrigins,
      };
    });
  };
  const setXnftPreferences = useSetRecoilState(atoms.xnftPreferences);
  // Solana
  const setSolanaConnectionUrl = (cluster: string) => {
    setPreferences((current) => {
      return {
        ...current,
        solana: {
          ...current.solana,
          cluster,
        },
      };
    });
  };
  const setSolanaExplorer = (explorer: string) => {
    setPreferences((current) => {
      return {
        ...current,
        solana: {
          ...current.solana,
          explorer,
        },
      };
    });
  };
  const setSolanaCommitment = (commitment: Commitment) => {
    setPreferences((current) => {
      return {
        ...current,
        solana: {
          ...current.solana,
          commitment,
        },
      };
    });
  };
  // Ethereum
  const setEthereumConnectionUrl = (connectionUrl: string) => {
    setPreferences((current) => {
      return {
        ...current,
        ethereum: {
          ...current.ethereum,
          connectionUrl,
        },
      };
    });
  };
  const setEthereumChainId = (chainId: string) => {
    setPreferences((current) => {
      return {
        ...current,
        ethereum: {
          ...current.ethereum,
          chainId,
        },
      };
    });
  };
  const setEthereumFeeData = useSetRecoilState(atoms.ethereumFeeData);
  // Balance update.
  const updateAllSplTokenAccounts = useUpdateAllSplTokenAccounts();
  const updateEthereumBalances = useUpdateEthereumBalances();
  // URL navigation.
  const navigate = useNavigate();

  useEffect(() => {
    ////////////////////////////////////////////////////////////////////////////
    // Notifications from background script.
    ////////////////////////////////////////////////////////////////////////////

    //
    // Notification dispatch.
    //
    const notificationsHandler = async (notif: Notification) => {
      logger.debug(`received notification ${notif.name}`, notif);

      switch (notif.name) {
        case NOTIFICATION_KEY_IS_COLD_UPDATE:
          handleKeyIsColdUpdate(notif);
          break;
        case NOTIFICATION_KEYRING_SET_MNEMONIC:
          handleKeyringSetMnemonic();
          break;
        case NOTIFICATION_KEYRING_STORE_CREATED:
          handleKeyringStoreCreated(notif);
          break;
        case NOTIFICATION_KEYRING_STORE_LOCKED:
          handleKeyringStoreLocked();
          break;
        case NOTIFICATION_KEYRING_STORE_UNLOCKED:
          handleKeyringStoreUnlocked(notif);
          break;
        case NOTIFICATION_KEYRING_STORE_RESET:
          handleReset();
          break;
        case NOTIFICATION_KEYRING_KEY_DELETE:
          handleKeyringKeyDelete(notif);
          break;
        case NOTIFICATION_KEYNAME_UPDATE:
          handleKeynameUpdate(notif);
          break;
        case NOTIFICATION_KEYRING_IMPORTED_WALLET:
          handleKeyringImportedWallet(notif);
          break;
        case NOTIFICATION_KEYRING_DERIVED_WALLET:
          handleKeyringDerivedWallet(notif);
          break;
        case NOTIFICATION_KEYRING_IMPORTED_SECRET_KEY:
          handleKeyringImportedSecretKey(notif);
          break;
        case NOTIFICATION_APPROVED_ORIGINS_UPDATE:
          handleApprovedOriginsUpdate(notif);
          break;
        case NOTIFICATION_NAVIGATION_URL_DID_CHANGE:
          handleNavigationUrlDidChange(notif);
          break;
        case NOTIFICATION_AUTO_LOCK_SETTINGS_UPDATED:
          handleAutoLockSettingsUpdated(notif);
          break;
        case NOTIFICATION_XNFT_PREFERENCE_UPDATED:
          handleXnftPreferenceUpdated(notif);
          break;
        case NOTIFICATION_DARK_MODE_UPDATED:
          handleIsDarkModeUpdated(notif);
          break;
        case NOTIFICATION_DEVELOPER_MODE_UPDATED:
          handleIsDeveloperModeUpdated(notif);
          break;
        case NOTIFICATION_AGGREGATE_WALLETS_UPDATED:
          handleAggregateWalletsUpdated(notif);
          break;
        case NOTIFICATION_SOLANA_EXPLORER_UPDATED:
          handleSolanaExplorerUpdated(notif);
          break;
        case NOTIFICATION_SOLANA_COMMITMENT_UPDATED:
          handleSolanaCommitmentUpdated(notif);
          break;
        case NOTIFICATION_SOLANA_SPL_TOKENS_DID_UPDATE:
          await handleSolanaSplTokensDidUpdate(notif);
          break;
        case NOTIFICATION_SOLANA_CONNECTION_URL_UPDATED:
          handleSolanaConnectionUrlUpdated(notif);
          break;
        case NOTIFICATION_SOLANA_ACTIVE_WALLET_UPDATED:
          handleSolanaActiveWalletUpdated(notif);
          break;
        case NOTIFICATION_ETHEREUM_ACTIVE_WALLET_UPDATED:
          handleEthereumActiveWalletUpdated(notif);
          break;
        case NOTIFICATION_ETHEREUM_CONNECTION_URL_UPDATED:
          handleEthereumConnectionUrlUpdated(notif);
          break;
        case NOTIFICATION_ETHEREUM_CHAIN_ID_UPDATED:
          handleEthereumChainIdUpdated(notif);
          break;
        case NOTIFICATION_ETHEREUM_TOKENS_DID_UPDATE:
          await handleEthereumTokensDidUpdate(notif);
          break;
        case NOTIFICATION_ETHEREUM_FEE_DATA_DID_UPDATE:
          handleEthereumFeeDataDidUpdate(notif);
          break;
        case NOTIFICATION_BLOCKCHAIN_KEYRING_CREATED:
          handleBlockchainKeyringCreated(notif);
          break;
        case NOTIFICATION_BLOCKCHAIN_KEYRING_DELETED:
          handleBlockchainKeyringDeleted(notif);
          break;
        case NOTIFICATION_FEATURE_GATES_UPDATED:
          handleSetFeatureGates(notif);
          break;
        case NOTIFICATION_KEYRING_STORE_USERNAME_ACCOUNT_CREATED:
          handleUsernameAccountCreated(notif);
          break;
        case NOTIFICATION_KEYRING_STORE_ACTIVE_USER_UPDATED:
          handleActiveUserUpdated(notif);
          break;
        case NOTIFICATION_KEYRING_STORE_REMOVED_USER:
          handleRemovedUser();
          break;
        case NOTIFICATION_ACTIVE_BLOCKCHAIN_UPDATED:
          handleActiveBlockchainUpdated(notif);
          break;
        case NOTIFICATION_USER_ACCOUNT_AUTHENTICATED:
          handleUserAccountAuthenticated(notif);
          break;
        case NOTIFICATION_USER_ACCOUNT_PUBLIC_KEY_CREATED:
          handleUserAccountPublicKeyCreated(notif);
          break;
        case NOTIFICATION_USER_ACCOUNT_PUBLIC_KEY_DELETED:
          handleUserAccountPublicKeyDeleted(notif);
          break;
        case NOTIFICATION_USER_ACCOUNT_PUBLIC_KEYS_UPDATED:
          handleUserAccountPublicKeysUpdated(notif);
          break;
        default:
          break;
      }
    };

    //
    // Notification handlers.
    //
    const handleKeyIsColdUpdate = (notif: Notification) => {
      setWalletData(notif.data.walletData);
    };

    const handleKeyringSetMnemonic = () => {
      setKeyringHasMnemonic(true);
    };

    const handleKeyringStoreCreated = (notif: Notification) => {
      setPreferences(notif.data.preferences);
      setKeyringStoreState(KeyringStoreState.Unlocked);
    };

    const handleKeyringStoreLocked = () => {
      setKeyringStoreState(KeyringStoreState.Locked);
      setAuthenticatedUser(null);
    };

    const handleKeyringStoreUnlocked = (notif: Notification) => {
      // Set the active user with the active user from the notification. This
      // is required because the recoil state can be read on the unlock screen
      // and may be updated by migrations that occur on an unlock attempt. The
      // recoil state won't be updated by migrations.
      setActiveUser(notif.data.activeUser);
      setKeyringStoreState(KeyringStoreState.Unlocked);
    };

    const handleKeyringKeyDelete = (notif: Notification) => {
      const { blockchain, deletedPublicKey } = notif.data;
      // Remove the deleted key from the key list.
      setWalletData((current) => {
        const publicKeys = { ...current.publicKeys };

        publicKeys[blockchain] = {
          hdPublicKeys: [
            ...publicKeys[blockchain].hdPublicKeys.filter(
              (key) => key.publicKey !== deletedPublicKey
            ),
          ],
          importedPublicKeys: [
            ...publicKeys[blockchain].importedPublicKeys.filter(
              (key) => key.publicKey !== deletedPublicKey
            ),
          ],
          ledgerPublicKeys: [
            ...publicKeys[blockchain].ledgerPublicKeys.filter(
              (key) => key.publicKey !== deletedPublicKey
            ),
          ],
        };

        const activePublicKeys = [...current.activePublicKeys].filter(
          (key) => key !== deletedPublicKey
        );

        return {
          ...current,
          activePublicKeys,
          publicKeys,
        };
      });
    };

    const handleKeynameUpdate = (notif: Notification) => {
      setWalletPublicKeysWithFn((current: any) => {
        // Using JSON for a deep copy
        const next: WalletPublicKeys = JSON.parse(JSON.stringify(current));
        for (const keyring of Object.values(next)) {
          for (const namedPublicKeys of Object.values(keyring)) {
            for (const namedPublicKey of namedPublicKeys) {
              if (namedPublicKey.publicKey === notif.data.publicKey) {
                namedPublicKey.name = notif.data.name;
              }
            }
          }
        }
        return next;
      });
    };

    //
    // TODO: the following three functions are almost the same, refactor into one
    //

    const handleKeyringImportedWallet = (notif: Notification) => {
      const { blockchain, publicKey, name } = notif.data;
      setWalletData((current: any) => {
        const publicKeys = { ...current.publicKeys };

        // Importing a new wallet can result in the initialisation of this
        // keyring so no guarantee the keyrings exist
        publicKeys[blockchain] = {
          hdPublicKeys: [
            ...(publicKeys[blockchain]
              ? publicKeys[blockchain].hdPublicKeys
              : []),
            // Add newly derived key
            {
              publicKey,
              name,
            },
          ],
          importedPublicKeys: [
            ...(publicKeys[blockchain]
              ? publicKeys[blockchain].importedPublicKeys
              : []),
          ],
          ledgerPublicKeys: [
            ...(publicKeys[blockchain]
              ? publicKeys[blockchain].ledgerPublicKeys
              : []),
          ],
        };

        const activePublicKeys = [...current.activePublicKeys, publicKey];

        return {
          ...current,
          activePublicKeys,
          publicKeys,
        };
      });
    };

    const handleKeyringDerivedWallet = (notif: Notification) => {
      const { blockchain, publicKey, name } = notif.data;
      setWalletData((current: any) => {
        const publicKeys = { ...current.publicKeys };
        // Deriving a new wallet can result in the initialisation of this
        // keyring so no guarantee the keyrings exist
        publicKeys[blockchain] = {
          hdPublicKeys: [
            ...(publicKeys[blockchain]
              ? publicKeys[blockchain].hdPublicKeys
              : []),
            // Add newly derived key
            {
              publicKey,
              name,
            },
          ],
          importedPublicKeys: [
            ...(publicKeys[blockchain]
              ? publicKeys[blockchain].importedPublicKeys
              : []),
          ],
          ledgerPublicKeys: [
            ...(publicKeys[blockchain]
              ? publicKeys[blockchain].ledgerPublicKeys
              : []),
          ],
        };

        const activePublicKeys = [...current.activePublicKeys, publicKey];

        return {
          ...current,
          activePublicKeys,
          publicKeys,
        };
      });
    };

    const handleKeyringImportedSecretKey = (notif: Notification) => {
      const { blockchain, publicKey, name } = notif.data;
      setWalletData((current: any) => {
        const publicKeys = { ...current.publicKeys };

        // Although not possible to initialise a new keyring by importing
        // a secret key, it may be possible in the future so this is handled
        // the same way as deriving
        publicKeys[blockchain] = {
          hdPublicKeys: [
            ...(publicKeys[blockchain]
              ? publicKeys[blockchain].hdPublicKeys
              : []),
          ],
          importedPublicKeys: [
            ...(publicKeys[blockchain]
              ? publicKeys[blockchain].importedPublicKeys
              : []),
            // Add newly imported key
            {
              publicKey,
              name,
            },
          ],
          ledgerPublicKeys: [
            ...(publicKeys[blockchain]
              ? publicKeys[blockchain].ledgerPublicKeys
              : []),
          ],
        };

        const activePublicKeys = [...current.activePublicKeys, publicKey];

        return {
          ...current,
          activePublicKeys,
          publicKeys,
        };
      });
    };

    const handleSolanaActiveWalletUpdated = (notif: Notification) => {
      allPlugins().forEach((p) => {
        p.pushSolanaPublicKeyChangedNotification(notif.data.activeWallet);
      });
      setActivePublicKeys(notif.data.activeWallets);
    };

    const handleReset = () => {
      setKeyringStoreState(KeyringStoreState.NeedsOnboarding);
    };

    const handleApprovedOriginsUpdate = (notif: Notification) => {
      setApprovedOrigins(notif.data.approvedOrigins);
    };

    const handleNavigationUrlDidChange = (notif: Notification) => {
      navigate(notif.data.url);
    };

    const handleAutoLockSettingsUpdated = (notif: Notification) => {
      setAutoLockSettings(notif.data.autoLockSettings);
    };

    const handleXnftPreferenceUpdated = (notif: Notification) => {
      setXnftPreferences(notif.data.updatedPreferences);
    };

    const handleIsDarkModeUpdated = (notif: Notification) => {
      setIsDarkMode(notif.data.darkMode);
    };

    const handleIsDeveloperModeUpdated = (notif: Notification) => {
      setIsDeveloperMode(notif.data.developerMode);
    };

    const handleAggregateWalletsUpdated = (notif: Notification) => {
      setIsAggregateWallets(notif.data.aggregateWallets);
    };

    const handleSolanaExplorerUpdated = (notif: Notification) => {
      setSolanaExplorer(notif.data.explorer);
    };

    const handleSolanaCommitmentUpdated = (notif: Notification) => {
      setSolanaCommitment(notif.data.commitment);
    };

    const handleSolanaConnectionUrlUpdated = (notif: Notification) => {
      setSolanaConnectionUrl(notif.data.url);
      allPlugins().forEach((p) => {
        p.pushSolanaConnectionChangedNotification(notif.data.url);
      });
    };

    const handleSolanaSplTokensDidUpdate = async (notif: Notification) => {
      await updateAllSplTokenAccounts({
        ...notif.data,
        customSplTokenAccounts:
          BackgroundSolanaConnection.customSplTokenAccountsFromJson(
            notif.data.customSplTokenAccounts
          ),
      });
    };

    const handleActiveBlockchainUpdated = (notif: Notification) => {
      setActiveBlockchain(notif.data.newBlockchain);
    };

    const handleUserAccountAuthenticated = (notif: Notification) => {
      logger.debug("dd handleUserAccountAuthenticated:notf", notif.data);
      setAuthenticatedUser({
        username: notif.data.username,
        uuid: notif.data.uuid,
        jwt: notif.data.jwt,
      });
    };

    const handleUserAccountPublicKeyCreated = (notif: Notification) => {
      setServerPublicKeys((current) => [...current, notif.data]);
    };

    const handleUserAccountPublicKeyDeleted = (notif: Notification) => {
      setServerPublicKeys((current) =>
        current.filter(
          (c) =>
            !(
              c.blockchain === notif.data.blockchain &&
              c.publicKey === notif.data.publicKey
            )
        )
      );
    };

    const handleUserAccountPublicKeysUpdated = (notif: Notification) => {
      setServerPublicKeys(notif.data.publicKeys);
    };

    const handleEthereumActiveWalletUpdated = (notif: Notification) => {
      allPlugins().forEach((p) => {
        p.pushEthereumPublicKeyChangedNotification(notif.data.activeWallet);
      });
      setActivePublicKeys(notif.data.activeWallets);
    };

    const handleEthereumTokensDidUpdate = async (notif: Notification) => {
      const { connectionUrl, activeWallet, balances } = notif.data;
      await updateEthereumBalances({
        connectionUrl,
        publicKey: activeWallet,
        balances,
      });
    };

    const handleEthereumFeeDataDidUpdate = (notif: Notification) => {
      setEthereumFeeData(notif.data.feeData);
    };

    const handleEthereumConnectionUrlUpdated = (notif: Notification) => {
      setEthereumConnectionUrl(notif.data.connectionUrl);
      allPlugins().forEach((p) => {
        p.pushEthereumConnectionChangedNotification(notif.data.connectionUrl);
      });
    };

    const handleEthereumChainIdUpdated = (notif: Notification) => {
      setEthereumChainId(notif.data.chainId);
    };

    const handleBlockchainKeyringCreated = (notif: Notification) => {
      setWalletData(notif.data.publicKeyData);
    };

    const handleBlockchainKeyringDeleted = (notif: Notification) => {
      setWalletData(notif.data.publicKeyData);
    };

    const handleSetFeatureGates = (notif: Notification) => {
      setFeatureGates((current) => ({
        ...current,
        ...notif.data.gates,
      }));
    };

    const handleUsernameAccountCreated = (notif: Notification) => {
      // Order of each setter matters here.
      setPreferences(notif.data.preferences);
      setXnftPreferences(notif.data.xnftPreferences);
      setWalletData(notif.data.walletData);
      setActiveUser(notif.data.user);
      resetAllUsers();
    };

    const handleActiveUserUpdated = (notif: Notification) => {
      // Order of each setter matters here.
      setPreferences(notif.data.preferences);
      setXnftPreferences(notif.data.xnftPreferences);
      setWalletData(notif.data.walletData);
      setActiveUser(notif.data.user);
      // Clear authenticated user
      setAuthenticatedUser(null);
      resetAllUsers();
      // resetNftCollections();
    };

    const handleRemovedUser = () => {
      resetAllUsers();
    };

    //
    // Initiate subscription.
    //
    ChannelAppUi.notifications(CHANNEL_POPUP_NOTIFICATIONS).onNotification(
      notificationsHandler
    );
  }, []);

  return (
    <_NotificationsContext.Provider value={{}}>
      {props.children}
    </_NotificationsContext.Provider>
  );
}

type NotificationsContext = {};
const _NotificationsContext = React.createContext<NotificationsContext | null>(
  null
);
