import React, { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import * as atoms from "../recoil/atoms";
import {
  debug,
  PortChannel,
  UI_RPC_METHOD_NOTIFICATIONS_SUBSCRIBE,
  CONNECTION_POPUP_NOTIFICATIONS,
  Notification,
  NOTIFICATION_KEYRING_STORE_LOCKED,
  NOTIFICATION_KEYRING_STORE_UNLOCKED,
  NOTIFICATION_KEYRING_KEY_DELETE,
  NOTIFICATION_KEYNAME_UPDATE,
  NOTIFICATION_KEYRING_DERIVED_WALLET,
  NOTIFICATION_ACTIVE_WALLET_UPDATED,
  NOTIFICATION_KEYRING_IMPORTED_SECRET_KEY,
  NOTIFICATION_KEYRING_RESET_MNEMONIC,
} from "../common";
import { getBackgroundClient } from "../background/client";
import { KeyringStoreStateEnum } from "../keyring/store";

// The Notifications provider is used to subscribe and handle notifications
// from the background script.
export function NotificationsProvider(props: any) {
  const setWalletPublicKeys = useSetRecoilState(atoms.walletPublicKeys);
  const setKeyringStoreState = useSetRecoilState(atoms.keyringStoreState);
  const setActiveWallet = useSetRecoilState(atoms.activeWallet);

  useEffect(() => {
    const backgroundClient = getBackgroundClient();

    //
    // Notification dispatch.
    //
    const notificationsHandler = (notif: Notification) => {
      debug(`received notification ${notif.name}`, notif);
      switch (notif.name) {
        case NOTIFICATION_KEYRING_STORE_LOCKED:
          handleKeyringStoreLocked(notif);
          break;
        case NOTIFICATION_KEYRING_STORE_UNLOCKED:
          handleKeyringStoreUnlocked(notif);
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
        case NOTIFICATION_ACTIVE_WALLET_UPDATED:
          handleActiveWalletUpdated(notif);
          break;
        case NOTIFICATION_KEYRING_RESET_MNEMONIC:
          handleResetMnemonic(notif);
          break;
        default:
          break;
      }
    };

    //
    // Notification handlers.
    //
    const handleKeyringStoreLocked = (_notif: Notification) => {
      setKeyringStoreState(KeyringStoreStateEnum.Locked);
    };
    const handleKeyringStoreUnlocked = (_notif: Notification) => {
      setKeyringStoreState(KeyringStoreStateEnum.Unlocked);
    };
    const handleKeyringKeyDelete = (_notif: Notification) => {
      // todo
    };
    const handleKeynameUpdate = (notif: Notification) => {
      setWalletPublicKeys((current) => {
        const next = {
          hdPublicKeys: [...current.hdPublicKeys.map((pk) => ({ ...pk }))],
          importedPublicKeys: [
            ...current.importedPublicKeys.map((pk) => ({ ...pk })),
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

        return next;
      });
    };
    const handleKeyringDerivedWallet = (notif: Notification) => {
      setWalletPublicKeys((current) => {
        const next = {
          ...current,
          hdPublicKeys: current.hdPublicKeys.concat([notif.data]),
        };
        return next;
      });
    };
    const handleActiveWalletUpdated = (notif: Notification) => {
      setActiveWallet(notif.data.activeWallet);
    };
    const handleKeyringImportedSecretKey = (notif: Notification) => {
      setWalletPublicKeys((current) => {
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

    //
    // Initiate subscription.
    //
    PortChannel.notifications(CONNECTION_POPUP_NOTIFICATIONS).onNotification(
      notificationsHandler
    );
    backgroundClient
      .request({
        method: UI_RPC_METHOD_NOTIFICATIONS_SUBSCRIBE,
        params: [],
      })
      .catch(console.error);
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
