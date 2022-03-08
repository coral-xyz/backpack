import React, { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import * as atoms from "../recoil/atoms";
import {
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
} from "../common";
import { getBackgroundClient } from "../background/client";
import { KeyringStoreStateEnum } from "../keyring/store";

type NotificationsContext = {
  //
};
const _NotificationsContext = React.createContext<NotificationsContext | null>(
  null
);

// The atoms provider is used as a hack so that we can access recoil state setters
// from outside the react component tree.
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
      switch (notif.name) {
        case NOTIFICATION_KEYRING_STORE_LOCKED:
          handleKeyringStoreLocked();
          break;
        case NOTIFICATION_KEYRING_STORE_UNLOCKED:
          handleKeyringStoreUnlocked();
          break;
        case NOTIFICATION_KEYRING_KEY_DELETE:
          handleKeyringKeyDelete();
          break;
        case NOTIFICATION_KEYNAME_UPDATE:
          handleKeynameUpdate();
          break;
        case NOTIFICATION_KEYRING_DERIVED_WALLET:
          handleKeyringDerivedWallet(notif);
          break;
        case NOTIFICATION_ACTIVE_WALLET_UPDATED:
          handleActiveWalletUpdated(notif);
          break;
        default:
          break;
      }
    };

    //
    // Notification handlers.
    //
    const handleKeyringStoreLocked = () => {
      if (setKeyringStoreState === null) {
        throw new Error("invariant violation");
      }
      setKeyringStoreState(KeyringStoreStateEnum.Locked);
    };
    const handleKeyringStoreUnlocked = () => {
      if (setKeyringStoreState === null) {
        throw new Error("invariant violation");
      }
      setKeyringStoreState(KeyringStoreStateEnum.Unlocked);
    };
    const handleKeyringKeyDelete = () => {
      // todo
    };
    const handleKeynameUpdate = () => {
      // todo
    };
    const handleKeyringDerivedWallet = (notif: Notification) => {
      setWalletPublicKeys((current) => {
        const next = {
          ...current,
          hdPublicKeys: current.hdPublicKeys.concat([notif.data]),
        };
        console.log("next", next);
        return next;
      });
    };
    const handleActiveWalletUpdated = (notif: Notification) => {
      setActiveWallet(notif.data.activeWallet);
    };

    //
    // Subscribe to notifications.
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
