import { useEffect } from "react";
import type { Notification } from "@coral-xyz/common";
import {
  CHANNEL_POPUP_NOTIFICATIONS,
  ChannelAppUi,
  getLogger,
  NOTIFICATION_CONNECTION_URL_UPDATED,
  NOTIFICATION_ETHEREUM_FEE_DATA_DID_UPDATE,
  NOTIFICATION_ETHEREUM_TOKENS_DID_UPDATE,
  NOTIFICATION_FEATURE_GATES_UPDATED,
  NOTIFICATION_KEYRING_STORE_ACTIVE_USER_UPDATED,
  NOTIFICATION_KEYRING_STORE_USERNAME_ACCOUNT_CREATED,
  NOTIFICATION_NAVIGATION_URL_DID_CHANGE,
  NOTIFICATION_SOLANA_SPL_TOKENS_DID_UPDATE,
  NOTIFICATION_XNFT_PREFERENCE_UPDATED,
} from "@coral-xyz/common";
import { BackgroundSolanaConnection } from "@coral-xyz/secure-clients/legacyCommon";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

import * as atoms from "../atoms";
import { allPlugins } from "../hooks";
import { useUpdateAllSplTokenAccounts, useUpdateEthereumBalances } from "../";

import { useNavigate } from "./useNavigatePolyfill";

const logger = getLogger("notifications-provider");

//
// The Notifications provider is used to subscribe and handle notifications
// from the background script. Among other things, this is useful to enforce
// a unidirectional data flow: app -> background script -> notifications.
//
export function NotificationsProvider(props: any) {
  const uuid = useRecoilValue(atoms.userUUIDAtom);

  // state of featureGates atom to update
  const [, setFeatureGates] = useRecoilState(atoms.featureGates);

  // this should be fetched automatically due to changing user.
  const setXnftPreferences = useSetRecoilState(atoms.xnftPreferences(uuid));

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
        case NOTIFICATION_NAVIGATION_URL_DID_CHANGE:
          handleNavigationUrlDidChange(notif);
          break;
        case NOTIFICATION_XNFT_PREFERENCE_UPDATED:
          handleXnftPreferenceUpdated(notif);
          break;
        case NOTIFICATION_SOLANA_SPL_TOKENS_DID_UPDATE:
          await handleSolanaSplTokensDidUpdate(notif);
          break;
        case NOTIFICATION_CONNECTION_URL_UPDATED:
          handleConnectionUrlUpdated(notif);
          break;
        case NOTIFICATION_ETHEREUM_TOKENS_DID_UPDATE:
          await handleEthereumTokensDidUpdate(notif);
          break;
        case NOTIFICATION_FEATURE_GATES_UPDATED:
          handleSetFeatureGates(notif);
          break;

        // Necessary?:
        case NOTIFICATION_ETHEREUM_FEE_DATA_DID_UPDATE:
          handleEthereumFeeDataDidUpdate(notif);
          break;
        case NOTIFICATION_KEYRING_STORE_USERNAME_ACCOUNT_CREATED:
          handleUsernameAccountCreated(notif);
          break;
        case NOTIFICATION_KEYRING_STORE_ACTIVE_USER_UPDATED:
          handleActiveUserUpdated(notif);
          break;
        default:
          break;
      }
    };

    //
    // Notification handlers.
    //

    const handleNavigationUrlDidChange = (notif: Notification) => {
      navigate(notif.data.url);
    };

    const handleXnftPreferenceUpdated = (notif: Notification) => {
      setXnftPreferences(notif.data.updatedPreferences);
    };

    const handleConnectionUrlUpdated = (notif: Notification) => {
      const { blockchain, url } = notif.data;
      // setBlockchainConnectionUrl(blockchain, url);
      allPlugins().forEach((p) => {
        p.pushConnectionChangedNotification(url, blockchain);
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

    const handleSetFeatureGates = (notif: Notification) => {
      setFeatureGates((current) => ({
        ...current,
        ...notif.data.gates,
      }));
    };

    const handleUsernameAccountCreated = (notif: Notification) => {
      // Order of each setter matters here.
      setXnftPreferences(notif.data.xnftPreferences);
    };

    const handleActiveUserUpdated = (notif: Notification) => {
      setXnftPreferences(notif.data.xnftPreferences);
    };

    //
    // Initiate subscription.
    //
    ChannelAppUi.notifications(CHANNEL_POPUP_NOTIFICATIONS).onNotification(
      notificationsHandler
    );
  }, []);

  return null;
}
