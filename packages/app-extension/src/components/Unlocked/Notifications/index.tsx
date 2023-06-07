// TODO: remove the line below
/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";
import { Notifications as _Notifications } from "@coral-xyz/data-components";
import { updateFriendshipIfExists } from "@coral-xyz/db";
import { Loading, useBreakpoints } from "@coral-xyz/react-common";
import { useFeatureGates } from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import IconButton from "@mui/material/IconButton";

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
              component={(props: any) => <Notifications {...props} />}
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
  const gates = useFeatureGates();

  const [openDrawer, setOpenDrawer] = isXs
    ? [false, () => {}]
    : useState(false);

  useEffect(() => {
    if (isXs) {
      nav!.setOptions({
        headerTitle: "Notifications",
      });
    }
  }, []);

  return gates.GQL_NOTIFICATIONS ? (
    <>
      <_Notifications
        loaderComponent={<NotificationsLoader />}
        onItemClick={(_n) => setOpenDrawer(true)}
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
  ) : (
    <LegacyNotifications />
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
