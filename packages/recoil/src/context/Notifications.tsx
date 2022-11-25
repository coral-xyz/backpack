import React, { useEffect } from "react";
import { useRecoilCallback, useSetRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import type { Notification } from "@coral-xyz/common";
import {
  getLogger,
  Blockchain,
  ChannelAppUi,
  BackgroundSolanaConnection,
  CHANNEL_POPUP_NOTIFICATIONS,
  NOTIFICATION_BLOCKCHAIN_ENABLED,
  NOTIFICATION_BLOCKCHAIN_DISABLED,
  NOTIFICATION_KEYRING_STORE_CREATED,
  NOTIFICATION_KEYRING_STORE_LOCKED,
  NOTIFICATION_KEYRING_STORE_UNLOCKED,
  NOTIFICATION_KEYRING_STORE_RESET,
  NOTIFICATION_KEYRING_KEY_DELETE,
  NOTIFICATION_KEYNAME_UPDATE,
  NOTIFICATION_KEYRING_DERIVED_WALLET,
  NOTIFICATION_KEYRING_IMPORTED_SECRET_KEY,
  NOTIFICATION_APPROVED_ORIGINS_UPDATE,
  NOTIFICATION_NAVIGATION_URL_DID_CHANGE,
  NOTIFICATION_AUTO_LOCK_SECS_UPDATED,
  NOTIFICATION_DARK_MODE_UPDATED,
  NOTIFICATION_DEVELOPER_MODE_UPDATED,
  NOTIFICATION_SOLANA_ACTIVE_WALLET_UPDATED,
  NOTIFICATION_SOLANA_SPL_TOKENS_DID_UPDATE,
  NOTIFICATION_ETHEREUM_ACTIVE_WALLET_UPDATED,
  NOTIFICATION_ETHEREUM_TOKENS_DID_UPDATE,
  NOTIFICATION_ETHEREUM_FEE_DATA_DID_UPDATE,
  NOTIFICATION_XNFT_PREFERENCE_UPDATED,
  NOTIFICATION_BLOCKCHAIN_SETTINGS_UPDATED,
} from "@coral-xyz/common";
import {
  KeyringStoreStateEnum,
  useUpdateEthereumBalances,
  useUpdateAllSplTokenAccounts,
} from "../";
import * as atoms from "../atoms";
import { allPlugins } from "../hooks";
import type { WalletPublicKeys } from "../types";

const logger = getLogger("notifications-provider");

//
// The Notifications provider is used to subscribe and handle notifications
// from the background script. Among other things, this is useful to enforce
// a unidirectional data flow: app -> background script -> notifications.
//
export function NotificationsProvider(props: any) {
  const setWalletPublicKeys = useSetRecoilState(atoms.walletPublicKeys);
  const setKeyringStoreState = useSetRecoilState(atoms.keyringStoreState);
  const setActiveWallets = useSetRecoilState(atoms.activeWallets);
  const setApprovedOrigins = useSetRecoilState(atoms.approvedOrigins);
  const setAutoLockSecs = useSetRecoilState(atoms.autoLockSecs);
  const setXnftPreferences = useSetRecoilState(atoms.xnftPreferences);
  const setIsDarkMode = useSetRecoilState(atoms.isDarkMode);
  const setIsDeveloperMode = useSetRecoilState(atoms.isDeveloperMode);
  const setEnabledBlockchains = useSetRecoilState(atoms.enabledBlockchains);
  // Solana
  const updateAllSplTokenAccounts = useUpdateAllSplTokenAccounts();
  // Ethereum
  const setEthereumFeeData = useSetRecoilState(atoms.ethereumFeeData);
  const updateEthereumBalances = useUpdateEthereumBalances();
  // Blockchain settings
  const updateBlockchainSettings = useRecoilCallback(
    ({ set }: any) =>
      async (blockchain: Blockchain, settings: any) => {
        set(atoms.blockchainSettings(blockchain), settings);
      }
  );
  const navigate = useNavigate();

  useEffect(() => {
    ////////////////////////////////////////////////////////////////////////////
    // Notifications from background script.
    ////////////////////////////////////////////////////////////////////////////

    //
    // Notification dispatch.
    //
    const notificationsHandler = (notif: Notification) => {
      logger.debug(`received notification ${notif.name}`, notif);

      switch (notif.name) {
        case NOTIFICATION_KEYRING_STORE_CREATED:
          handleKeyringStoreCreated();
          break;
        case NOTIFICATION_KEYRING_STORE_LOCKED:
          handleKeyringStoreLocked();
          break;
        case NOTIFICATION_KEYRING_STORE_UNLOCKED:
          handleKeyringStoreUnlocked();
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
        case NOTIFICATION_AUTO_LOCK_SECS_UPDATED:
          handleAutoLockSecsUpdated(notif);
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
        case NOTIFICATION_SOLANA_ACTIVE_WALLET_UPDATED:
          handleSolanaActiveWalletUpdated(notif);
          break;
        case NOTIFICATION_SOLANA_SPL_TOKENS_DID_UPDATE:
          handleSolanaSplTokensDidUpdate(notif);
          break;
        case NOTIFICATION_ETHEREUM_ACTIVE_WALLET_UPDATED:
          handleEthereumActiveWalletUpdated(notif);
          break;
        case NOTIFICATION_ETHEREUM_TOKENS_DID_UPDATE:
          handleEthereumTokensDidUpdate(notif);
          break;
        case NOTIFICATION_ETHEREUM_FEE_DATA_DID_UPDATE:
          handleEthereumFeeDataDidUpdate(notif);
          break;
        case NOTIFICATION_BLOCKCHAIN_ENABLED:
          handleBlockchainEnabled(notif);
          break;
        case NOTIFICATION_BLOCKCHAIN_DISABLED:
          handleBlockchainDisabled(notif);
          break;
        case NOTIFICATION_BLOCKCHAIN_SETTINGS_UPDATED:
          handleBlockchainSettingsUpdated(notif);
          break;
        default:
          break;
      }
    };

    //
    // Notification handlers.
    //
    const handleKeyringStoreCreated = () => {
      setKeyringStoreState(KeyringStoreStateEnum.Unlocked);
    };

    const handleKeyringStoreLocked = () => {
      setKeyringStoreState(KeyringStoreStateEnum.Locked);
    };

    const handleKeyringStoreUnlocked = () => {
      setKeyringStoreState(KeyringStoreStateEnum.Unlocked);
    };

    const handleKeyringKeyDelete = (notif: Notification) => {
      const { blockchain, deletedPublicKey } = notif.data;
      // Remove the deleted key from the key list.
      setWalletPublicKeys((current) => {
        return {
          ...current,
          [blockchain]: {
            hdPublicKeys: [
              ...current[blockchain].hdPublicKeys.filter(
                (key) => key.publicKey !== deletedPublicKey
              ),
            ],
            importedPublicKeys: [
              ...current[blockchain].importedPublicKeys.filter(
                (key) => key.publicKey !== deletedPublicKey
              ),
            ],
            ledgerPublicKeys: [
              ...current[blockchain].ledgerPublicKeys.filter(
                (key) => key.publicKey !== deletedPublicKey
              ),
            ],
          },
        };
      });
    };

    const handleKeynameUpdate = (notif: Notification) => {
      setWalletPublicKeys((current: any) => {
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

    const handleKeyringDerivedWallet = (notif: Notification) => {
      const { blockchain, publicKey, name } = notif.data;
      setWalletPublicKeys((current: any) => {
        // Deriving a new wallet can result in the initialisation of this
        // keyring so no guarantee the keyrings exist
        const blockchainKeyrings = {
          hdPublicKeys: [
            ...(current[blockchain] ? current[blockchain].hdPublicKeys : []),
            // Add newly derived key
            {
              publicKey,
              name,
            },
          ],
          importedPublicKeys: [
            ...(current[blockchain]
              ? current[blockchain].importedPublicKeys
              : []),
          ],
          ledgerPublicKeys: [
            ...(current[blockchain]
              ? current[blockchain].ledgerPublicKeys
              : []),
          ],
        };

        return {
          ...current,
          [blockchain]: blockchainKeyrings,
        };
      });
    };

    const handleKeyringImportedSecretKey = (notif: Notification) => {
      const { blockchain, publicKey, name } = notif.data;
      setWalletPublicKeys((current: any) => {
        // Although not possible to initialise a new keyring by importing
        // a secret key, it may be possible in the future so this is handled
        // the same way as deriving
        const blockchainKeyrings = {
          hdPublicKeys: [
            ...(current[blockchain] ? current[blockchain].hdPublicKeys : []),
          ],
          importedPublicKeys: [
            ...(current[blockchain]
              ? current[blockchain].importedPublicKeys
              : []),
            // Add newly imported key
            {
              publicKey,
              name,
            },
          ],
          ledgerPublicKeys: [
            ...(current[blockchain]
              ? current[blockchain].ledgerPublicKeys
              : []),
          ],
        };
        return {
          ...current,
          [blockchain]: blockchainKeyrings,
        };
      });
    };

    const handleSolanaActiveWalletUpdated = (notif: Notification) => {
      allPlugins().forEach((p) => {
        p.pushSolanaPublicKeyChangedNotification(notif.data.activeWallet);
      });
      setActiveWallets(notif.data.activeWallets);
    };

    const handleReset = () => {
      setKeyringStoreState(KeyringStoreStateEnum.NeedsOnboarding);
    };

    const handleApprovedOriginsUpdate = (notif: Notification) => {
      setApprovedOrigins(notif.data.approvedOrigins);
    };

    const handleNavigationUrlDidChange = (notif: Notification) => {
      navigate(notif.data.url);
    };

    const handleAutoLockSecsUpdated = (notif: Notification) => {
      setAutoLockSecs(notif.data.autoLockSecs);
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

    const handleSolanaSplTokensDidUpdate = (notif: Notification) => {
      const publicKey = notif.data.publicKey;
      const connectionUrl = notif.data.connectionUrl;
      const result = BackgroundSolanaConnection.customSplTokenAccountsFromJson(
        notif.data.customSplTokenAccounts
      );
      const customSplTokenAccounts = {
        ...result,
        tokenAccounts: new Map(
          result.tokenAccountsMap.map((t: any) => [t[0], t[1]])
        ),
      };
      updateAllSplTokenAccounts({
        publicKey,
        connectionUrl,
        customSplTokenAccounts,
      });
    };

    const handleEthereumActiveWalletUpdated = (notif: Notification) => {
      allPlugins().forEach((p) => {
        p.pushEthereumPublicKeyChangedNotification(notif.data.activeWallet);
      });
      setActiveWallets(notif.data.activeWallets);
    };

    const handleEthereumTokensDidUpdate = (notif: Notification) => {
      const { connectionUrl, activeWallet, balances } = notif.data;
      updateEthereumBalances({
        connectionUrl,
        publicKey: activeWallet,
        balances,
      });
    };

    const handleEthereumFeeDataDidUpdate = (notif: Notification) => {
      setEthereumFeeData(notif.data.feeData);
    };

    const handleBlockchainEnabled = (notif: Notification) => {
      setEnabledBlockchains(notif.data.enabledBlockchains);
    };

    const handleBlockchainDisabled = (notif: Notification) => {
      setEnabledBlockchains(notif.data.enabledBlockchains);
    };

    const handleBlockchainSettingsUpdated = (notif: Notification) => {
      const { blockchain, prevSettings, newSettings } = notif.data;
      updateBlockchainSettings(blockchain, newSettings);
      if (prevSettings.connectionUrl !== newSettings.connectionUrl) {
        if (blockchain === Blockchain.SOLANA) {
          allPlugins().forEach((p) => {
            p.pushSolanaConnectionChangedNotification(notif.data.url);
          });
        }
        if (blockchain === Blockchain.ETHEREUM) {
          allPlugins().forEach((p) => {
            p.pushEthereumConnectionChangedNotification(
              notif.data.connectionUrl
            );
          });
        }
      }
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
