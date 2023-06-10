// TODO: remove the line below
/* eslint-disable react-hooks/rules-of-hooks */
import { useCallback, useEffect, useState } from "react";
import {
  Notifications as _Notifications,
  type ResponseNotification,
} from "@coral-xyz/data-components";
import { updateFriendshipIfExists } from "@coral-xyz/db";
import { Loading, useBreakpoints } from "@coral-xyz/react-common";
import { useFeatureGates, useOpenPlugin } from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import IconButton from "@mui/material/IconButton";
import { PublicKey } from "@solana/web3.js";

import { CloseButton, WithDrawer } from "../../common/Layout/Drawer";
import {
  NavStackEphemeral,
  NavStackScreen,
  useNavigation,
} from "../../common/Layout/NavStack";
import { NotificationIconWithBadge } from "../../common/NotificationIconWithBadge";
import { ContactRequests, Contacts } from "../Messages/Contacts";

import { Notifications as LegacyNotifications } from "./legacy";

const useStyles = styles(() => ({
  networkSettingsButtonContainer: {
    display: "flex",
    flexDirection: "row-reverse",
    width: "38px",
  },
  networkSettingsButton: {
    padding: 0,
    width: "24px",
    "&:hover": {
      background: "transparent",
    },
  },
}));

export function NotificationButton() {
  const classes = useStyles();
  const [openDrawer, setOpenDrawer] = useState(false);
  const theme = useCustomTheme();
  const gates = useFeatureGates();

  const _Component = gates.GQL_NOTIFICATIONS
    ? Notifications
    : LegacyNotifications;

  return (
    <div className={classes.networkSettingsButtonContainer}>
      <IconButton
        disableRipple
        className={classes.networkSettingsButton}
        onClick={() => setOpenDrawer(true)}
        size="large"
      >
        <NotificationIconWithBadge
          style={{
            color: theme.custom.colors.icon,
            backgroundColor: "transparent",
            borderRadius: "12px",
          }}
        />
      </IconButton>
      <WithDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
        <div style={{ height: "100%" }}>
          <NavStackEphemeral
            initialRoute={{ name: "root" }}
            options={() => ({ title: "Notifications" })}
            navButtonLeft={<CloseButton onClick={() => setOpenDrawer(false)} />}
          >
            <NavStackScreen
              name="root"
              component={(props: any) => <_Component {...props} />}
            />
            <NavStackScreen
              name="contacts"
              component={(props: any) => <Contacts {...props} />}
            />
            <NavStackScreen
              name="contact-requests"
              component={(props: any) => <ContactRequests {...props} />}
            />
            <NavStackScreen
              name="contact-requests-sent"
              component={(props: any) => <ContactRequests {...props} />}
            />
          </NavStackEphemeral>
        </div>
      </WithDrawer>
    </div>
  );
}

export function Notifications() {
  const { isXs } = useBreakpoints();
  const nav = isXs ? useNavigation() : null;
  const openPlugin = useOpenPlugin();

  const [openDrawer, setOpenDrawer] = isXs
    ? [false, () => {}]
    : useState(false);

  /**
   * Component effect hook to set the navigation drawer title.
   */
  useEffect(() => {
    if (isXs && nav) {
      nav.setOptions({
        headerTitle: "Notifications",
      });
    }
  }, []);

  /**
   * Handle a click event on a single notification item in the list.
   * @param {ResponseNotification} notification
   */
  const handleItemClick = useCallback(
    (notification: ResponseNotification) => {
      // Open contacts navigation path if the source is related to friends
      if (
        notification.source === "friend_requests" ||
        notification.source === "friend_requests_accept"
      ) {
        if (isXs && nav) {
          nav.push("contacts");
        } else {
          setOpenDrawer(true);
        }
      } else {
        // Open an xNFT plugin if the source is a valid public key
        let pk: PublicKey | undefined;
        try {
          pk = new PublicKey(notification.source);
        } catch {
          // NOOP
        }

        if (pk !== undefined) {
          openPlugin(pk.toBase58());
        }
      }
    },
    [isXs, nav, openPlugin, setOpenDrawer]
  );

  return (
    <>
      <_Notifications
        loaderComponent={<NotificationsLoader />}
        onItemClick={handleItemClick}
        onAcceptFriendRequest={(activeUser, otherUser) =>
          updateFriendshipIfExists(activeUser, otherUser, {
            requested: 0,
            areFriends: 1,
          })
        }
        onDeclineFriendRequest={(activeUser, otherUser) =>
          updateFriendshipIfExists(activeUser, otherUser, {
            areFriends: 0,
            remoteRequested: 0,
            requested: 0,
          })
        }
      />
      {!isXs ? (
        <WithDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
          <div style={{ height: "100%" }}>
            <NavStackEphemeral
              initialRoute={{ name: "root" }}
              options={() => ({ title: "Notifications" })}
              navButtonLeft={
                <CloseButton onClick={() => setOpenDrawer(false)} />
              }
            >
              <NavStackScreen
                name="root"
                component={(props: any) => <Contacts {...props} />}
              />
              <NavStackScreen
                name="contact-requests"
                component={(props: any) => <ContactRequests {...props} />}
              />
              <NavStackScreen
                name="contact-requests-sent"
                component={(props: any) => <ContactRequests {...props} />}
              />
            </NavStackEphemeral>
          </div>
        </WithDrawer>
      ) : null}
    </>
  );
}

function NotificationsLoader() {
  return (
    <div
      style={{
        height: "68px",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <Loading iconStyle={{ width: "35px", height: "35px" }} />
      </div>
    </div>
  );
}
