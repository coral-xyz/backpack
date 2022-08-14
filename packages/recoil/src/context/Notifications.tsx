import React, { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import {
  getLogger,
  ChannelAppUi,
  Notification,
  BackgroundSolanaConnection,
  CHANNEL_POPUP_NOTIFICATIONS,
  NOTIFICATION_KEYRING_STORE_CREATED,
  NOTIFICATION_KEYRING_STORE_LOCKED,
  NOTIFICATION_KEYRING_STORE_UNLOCKED,
  NOTIFICATION_KEYRING_STORE_RESET,
  NOTIFICATION_KEYRING_KEY_DELETE,
  NOTIFICATION_KEYNAME_UPDATE,
  NOTIFICATION_KEYRING_DERIVED_WALLET,
  NOTIFICATION_ACTIVE_WALLET_UPDATED,
  NOTIFICATION_KEYRING_IMPORTED_SECRET_KEY,
  NOTIFICATION_KEYRING_RESET_MNEMONIC,
  NOTIFICATION_APPROVED_ORIGINS_UPDATE,
  NOTIFICATION_NAVIGATION_URL_DID_CHANGE,
  NOTIFICATION_AUTO_LOCK_SECS_UPDATED,
  NOTIFICATION_DARK_MODE_UPDATED,
  NOTIFICATION_SOLANA_SPL_TOKENS_DID_UPDATE,
  NOTIFICATION_SOLANA_CONNECTION_URL_UPDATED,
  NOTIFICATION_SOLANA_EXPLORER_UPDATED,
  NOTIFICATION_SOLANA_COMMITMENT_UPDATED,
} from "@coral-xyz/common";
import { KeyringStoreStateEnum, useUpdateAllSplTokenAccounts } from "../";
import * as atoms from "../atoms";
import { allPlugins } from "../hooks";

const logger = getLogger("notifications-provider");

//
// The Notifications provider is used to subscribe and handle notifications
// from the background script. Among other things, this is useful to enforce
// a unidirectional data flow: app -> background script -> notifications.
//
export function NotificationsProvider(props: any) {
  const setWalletPublicKeys = useSetRecoilState(atoms.walletPublicKeys);
  const setKeyringStoreState = useSetRecoilState(atoms.keyringStoreState);
  const setActiveWallet = useSetRecoilState(atoms.activeWallet);
  const setApprovedOrigins = useSetRecoilState(atoms.approvedOrigins);
  const setConnectionUrl = useSetRecoilState(atoms.connectionUrl);
  const setAutoLockSecs = useSetRecoilState(atoms.autoLockSecs);
  const setSolanaExplorer = useSetRecoilState(atoms.solanaExplorer);
  const setSolanaCommitment = useSetRecoilState(atoms.solanaCommitment);
  const setIsDarkMode = useSetRecoilState(atoms.isDarkMode);
  const updateAllSplTokenAccounts = useUpdateAllSplTokenAccounts();
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
          handleKeyringStoreCreated(notif);
          break;
        case NOTIFICATION_KEYRING_STORE_LOCKED:
          handleKeyringStoreLocked(notif);
          break;
        case NOTIFICATION_KEYRING_STORE_UNLOCKED:
          handleKeyringStoreUnlocked(notif);
          break;
        case NOTIFICATION_KEYRING_STORE_RESET:
          handleReset(notif);
          break;
        case NOTIFICATION_KEYRING_KEY_DELETE:
          handleKeyringKeyDelete(notif);
          break;
        case NOTIFICATION_KEYRING_RESET_MNEMONIC:
          handleResetMnemonic(notif);
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
        case NOTIFICATION_ACTIVE_WALLET_UPDATED:
          handleActiveWalletUpdated(notif);
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
        case NOTIFICATION_DARK_MODE_UPDATED:
          handleIsDarkModeUpdated(notif);
          break;
        case NOTIFICATION_SOLANA_EXPLORER_UPDATED:
          handleSolanaExplorerUpdated(notif);
          break;
        case NOTIFICATION_SOLANA_COMMITMENT_UPDATED:
          handleSolanaCommitmentUpdated(notif);
          break;
        case NOTIFICATION_SOLANA_SPL_TOKENS_DID_UPDATE:
          handleSolanaSplTokensDidUpdate(notif);
          break;
        case NOTIFICATION_SOLANA_CONNECTION_URL_UPDATED:
          handleSolanaConnectionUrlUpdated(notif);
          break;
        default:
          break;
      }
    };

    //
    // Notification handlers.
    //
    const handleKeyringStoreCreated = (_notif: Notification) => {
      setKeyringStoreState(KeyringStoreStateEnum.Unlocked);
    };
    const handleKeyringStoreLocked = (_notif: Notification) => {
      setKeyringStoreState(KeyringStoreStateEnum.Locked);
    };
    const handleKeyringStoreUnlocked = (_notif: Notification) => {
      setKeyringStoreState(KeyringStoreStateEnum.Unlocked);
    };
    const handleKeyringKeyDelete = (notif: Notification) => {
      const { deletedPublicKey, activeWallet } = notif.data;
      // todo
      // update wallet list atom
      // update active wallet atom if needed
    };
    const handleKeynameUpdate = (notif: Notification) => {
      setWalletPublicKeys((current: any) => {
        const next = {
          hdPublicKeys: [...current.hdPublicKeys.map((pk: any) => ({ ...pk }))],
          importedPublicKeys: [
            ...current.importedPublicKeys.map((pk: any) => ({ ...pk })),
          ],
          ledgerPublicKeys: [
            ...current.ledgerPublicKeys.map((pk: any) => ({ ...pk })),
          ],
        };

        // Find the key this notification is referring to and then mutate the
        // name.
        next.hdPublicKeys.forEach((key) => {
          if (key.publicKey === notif.data.publicKey) {
            key.name = notif.data.name;
          }
        });
        next.importedPublicKeys.forEach((key) => {
          if (key.publicKey === notif.data.publicKey) {
            key.name = notif.data.name;
          }
        });
        next.ledgerPublicKeys.forEach((key) => {
          if (key.publicKey === notif.data.publicKey) {
            key.name = notif.data.name;
          }
        });

        return next;
      });
    };
    const handleKeyringDerivedWallet = (notif: Notification) => {
      setWalletPublicKeys((current: any) => {
        const next = {
          ...current,
          hdPublicKeys: current.hdPublicKeys.concat([notif.data]),
        };
        return next;
      });
    };
    const handleActiveWalletUpdated = (notif: Notification) => {
      setActiveWallet(notif.data.activeWallet);
      allPlugins().forEach((p) => {
        p.pushPublicKeyChangedNotification(notif.data.activeWallet);
      });
    };
    const handleKeyringImportedSecretKey = (notif: Notification) => {
      setWalletPublicKeys((current: any) => {
        const next = {
          ...current,
          importedPublicKeys: current.importedPublicKeys.concat([notif.data]),
        };
        return next;
      });
    };
    const handleResetMnemonic = (notif: Notification) => {
      // TODO.
    };
    const handleReset = (_notif: Notification) => {
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
    const handleIsDarkModeUpdated = (notif: Notification) => {
      setIsDarkMode(notif.data.darkMode);
    };
    const handleSolanaExplorerUpdated = (notif: Notification) => {
      setSolanaExplorer(notif.data.explorer);
    };
    const handleSolanaCommitmentUpdated = (notif: Notification) => {
      setSolanaCommitment(notif.data.commitment);
    };
    const handleSolanaConnectionUrlUpdated = (notif: Notification) => {
      setConnectionUrl(notif.data.url);
      allPlugins().forEach((p) => {
        p.pushConnectionChangedNotification(notif.data.url);
      });
    };
    const handleSolanaSplTokensDidUpdate = (notif: Notification) => {
      const publicKey = notif.data.publicKey;
      const connectionUrl = notif.data.connectionUrl;
      const result = BackgroundSolanaConnection.customSplTokenAccountsFromJson(
        notif.data.customSplTokenAccounts
      );
      updateAllSplTokenAccounts({
        publicKey,
        connectionUrl,
        customSplTokenAccounts: {
          ...result,
          tokenAccounts: result.tokenAccountsMap.map((t: any) => t[1]),
        },
      });
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
