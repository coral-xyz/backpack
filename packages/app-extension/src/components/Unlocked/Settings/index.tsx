import { Suspense, useEffect } from "react";
import {
  BACKPACK_FEATURE_POP_MODE,
  BACKPACK_FEATURE_XNFT,
  MESSAGES_ENABLED,
  NOTIFICATIONS_ENABLED,
  openPopupWindow,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
} from "@coral-xyz/common";
import {
  ContactsIcon,
  GridIcon,
  LaunchDetail,
  List,
  ListItem,
  PushDetail,
} from "@coral-xyz/react-common";
import { useBackgroundClient, useFeatureGates } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import {
  AccountCircleOutlined,
  Lock,
  Settings,
  Tab as WindowIcon,
} from "@mui/icons-material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { Typography } from "@mui/material";

import { useNavStack } from "../../common/Layout/NavStack";
import { RecentActivityButton } from "../../Unlocked/Balances/RecentActivity";
import { NotificationButton } from "../Balances/Notifications";

import { AvatarHeader } from "./AvatarHeader/AvatarHeader";
import { AvatarPopoverButton } from "./AvatarPopover";
import { UserAccountsMenuButton } from "./UsernamesMenu";

export function SettingsButton() {
  const featureGates = useFeatureGates();
  return (
    <div style={{ display: "flex" }}>
      <RecentActivityButton />
      {featureGates[NOTIFICATIONS_ENABLED] && <NotificationButton />}
      <div style={{ width: "16px" }} />
      <AvatarPopoverButton />
    </div>
  );
}

export function SettingsMenu() {
  const { setTitle } = useNavStack();

  useEffect(() => {
    setTitle(<UserAccountsMenuButton />);
  }, [setTitle]);

  return (
    <Suspense fallback={<div></div>}>
      <_SettingsContent />
    </Suspense>
  );
}

function _SettingsContent() {
  return (
    <div>
      <AvatarHeader />
      <SettingsList />
    </div>
  );
}

function SettingsList() {
  const theme = useCustomTheme();
  const nav = useNavStack();
  const background = useBackgroundClient();
  const featureGates = useFeatureGates();

  const lockWallet = () => {
    background
      .request({
        method: UI_RPC_METHOD_KEYRING_STORE_LOCK,
        params: [],
      })
      .catch(console.error);
  };

  const walletsMenu = [
    {
      label: "Wallets",
      onClick: () => nav.push("edit-wallets"),
      icon: (props: any) => <AccountBalanceWalletIcon {...props} />,
      detailIcon: <PushDetail />,
    },
  ];

  const settingsMenu = [
    {
      label: "Your Account",
      onClick: () => nav.push("your-account"),
      icon: (props: any) => <AccountCircleOutlined {...props} />,
      detailIcon: <PushDetail />,
    },
    {
      label: "Preferences",
      onClick: () => nav.push("preferences"),
      icon: (props: any) => <Settings {...props} />,
      detailIcon: <PushDetail />,
    },
  ];

  if (featureGates[MESSAGES_ENABLED]) {
    settingsMenu.push({
      label: "Contacts",
      onClick: () => nav.push("contacts"),
      icon: (props: any) => <ContactsIcon {...props} />,
      detailIcon: <PushDetail />,
    });
    settingsMenu.push({
      label: "Requests",
      onClick: () => nav.push("requests"),
      icon: (props: any) => <ContactsIcon {...props} />,
      detailIcon: <PushDetail />,
    });
  }

  if (BACKPACK_FEATURE_XNFT) {
    settingsMenu.push({
      label: "xNFTs",
      onClick: () => nav.push("xnfts"),
      icon: (props: any) => (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <GridIcon
            {...props}
            style={{ ...props.style, width: "24px", height: "20px" }}
          />
        </div>
      ),
      detailIcon: <PushDetail />,
    });
  }
  settingsMenu.push({
    label: "Lock",
    onClick: () => lockWallet(),
    icon: (props: any) => <Lock {...props} />,
    detailIcon: <></>,
  });

  const aboutList = [
    {
      label: "About Backpack",
      onClick: () => nav.push("about-backpack"),
      icon: null,
      detailIcon: <PushDetail />,
    },
  ];

  return (
    <>
      <List
        style={{
          marginTop: "24px",
          marginBottom: "16px",
          border: `${theme.custom.colors.borderFull}`,
          borderRadius: "10px",
        }}
      >
        {walletsMenu.map((s, idx) => {
          return (
            <ListItem
              key={s.label}
              isFirst={idx === 0}
              isLast={idx === walletsMenu.length - 1}
              onClick={s.onClick}
              id={s.label}
              style={{
                height: "44px",
                padding: "12px",
              }}
              detail={s.detailIcon}
            >
              <div
                style={{
                  display: "flex",
                  flex: 1,
                }}
              >
                {s.icon({
                  style: {
                    color: theme.custom.colors.icon,
                    height: "24px",
                    width: "24px",
                  },
                  fill: theme.custom.colors.icon,
                })}
                <Typography
                  style={{
                    marginLeft: "8px",
                    fontWeight: 500,
                    fontSize: "16px",
                    lineHeight: "24px",
                  }}
                >
                  {s.label}
                </Typography>
              </div>
            </ListItem>
          );
        })}
      </List>
      <List
        style={{
          marginTop: "12px",
          marginBottom: "16px",
          border: `${theme.custom.colors.borderFull}`,
          borderRadius: "10px",
        }}
      >
        {settingsMenu.map((s, idx) => {
          return (
            <ListItem
              key={s.label}
              isFirst={idx === 0}
              isLast={idx === settingsMenu.length - 1}
              onClick={s.onClick}
              id={s.label}
              style={{
                height: "44px",
                padding: "12px",
              }}
              detail={s.detailIcon}
            >
              <div
                style={{
                  display: "flex",
                  flex: 1,
                }}
              >
                {s.icon({
                  style: {
                    color: theme.custom.colors.icon,
                    marginRight: "8px",
                    height: "24px",
                    width: "24px",
                  },
                  fill: theme.custom.colors.icon,
                })}
                <Typography
                  style={{
                    fontWeight: 500,
                    fontSize: "16px",
                    lineHeight: "24px",
                  }}
                >
                  {s.label}
                </Typography>
              </div>
            </ListItem>
          );
        })}
      </List>
      <List
        style={{
          marginTop: "12px",
          marginBottom: "16px",
          border: `${theme.custom.colors.borderFull}`,
          borderRadius: "10px",
        }}
      >
        {aboutList.map((s, idx) => {
          return (
            <ListItem
              key={s.label}
              isFirst={idx === 0}
              isLast={idx === aboutList.length - 1}
              onClick={s.onClick}
              id={s.label}
              style={{
                height: "44px",
                padding: "12px",
              }}
              detail={s.detailIcon}
            >
              <div
                style={{
                  display: "flex",
                  flex: 1,
                }}
              >
                <Typography
                  style={{
                    marginLeft: "8px",
                    fontWeight: 500,
                    fontSize: "16px",
                    lineHeight: "24px",
                  }}
                >
                  {s.label}
                </Typography>
              </div>
            </ListItem>
          );
        })}
      </List>
    </>
  );
}
