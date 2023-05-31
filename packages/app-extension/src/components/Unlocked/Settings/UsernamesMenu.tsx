import { useState } from "react";
import {
  openAddUserAccount,
  UI_RPC_METHOD_ACTIVE_USER_UPDATE,
} from "@coral-xyz/common";
import { ListItem, ProxyImage } from "@coral-xyz/react-common";
import {
  useAllUsers,
  useAvatarUrl,
  useBackgroundClient,
  useUser,
} from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { Add, Check, ExpandMore } from "@mui/icons-material";
import { Button, Typography } from "@mui/material";

import {
  useDrawerContext,
  WithMiniDrawer,
} from "../../../components/common/Layout/Drawer";

const useStyles = styles((theme) => ({
  addAccountButton: {
    color: theme.custom.colors.fontColor,
    "&:hover": {
      background: "transparent !important",
    },
  },
}));

function UserAccountMenu() {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        background: theme.custom.colors.backgroundBackdrop,
        padding: "16px",
      }}
    >
      <Typography
        style={{
          marginTop: "8px",
          marginBottom: "16px",
          fontSize: "18px",
          lineHeight: "24px",
          color: theme.custom.colors.fontColor,
        }}
      >
        Accounts
      </Typography>
      <UsersList />
      <AddAnotherAccountButton />
    </div>
  );
}

function UsersList() {
  const theme = useCustomTheme();
  const users = useAllUsers();
  const _user = useUser();
  return (
    <div
      style={{
        border: `${theme.custom.colors.borderFull}`,
        borderRadius: "12px",
      }}
    >
      {users.map(({ username, uuid }: any, idx: number) => (
        <UserAccountListItem
          key={username}
          uuid={uuid}
          isFirst={idx === 0}
          isLast={idx === users.length - 1}
          username={username}
          isActive={_user.username === username}
        />
      ))}
    </div>
  );
}

function UserAccountListItem({
  uuid,
  username,
  isFirst,
  isLast,
  isActive,
}: {
  uuid: string;
  username: string;
  isFirst: boolean;
  isLast: boolean;
  isActive: boolean;
}) {
  const theme = useCustomTheme();
  const avatarUrl = useAvatarUrl(24, username);
  const background = useBackgroundClient();
  const drawer = useDrawerContext();
  return (
    <ListItem
      isFirst={isFirst}
      isLast={isLast}
      disableRipple
      style={{
        background: theme.custom.colors.nav,
        height: "48px",
        display: "flex",
        paddingLeft: "12px",
        paddingRight: "12px",
        borderTopLeftRadius: isFirst ? "8px" : 0,
        borderTopRightRadius: isFirst ? "8px" : 0,
        borderBottomLeftRadius: isLast ? "8px" : 0,
        borderBottomRightRadius: isLast ? "8px" : 0,
        flex: 1,
      }}
      onClick={async () => {
        await background.request({
          method: UI_RPC_METHOD_ACTIVE_USER_UPDATE,
          params: [uuid],
        });
        drawer.close();
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
          }}
        >
          <MiniAvatarIcon avatarUrl={avatarUrl} />
          <Typography
            style={{
              marginLeft: "12px",
              color: theme.custom.colors.fontColor,
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            @{username}
          </Typography>
        </div>
        {isActive ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <Check
              style={{
                opacity: 0.8,
                color: theme.custom.colors.fontColor,
              }}
            />
          </div>
        ) : null}
      </div>
    </ListItem>
  );
}

function MiniAvatarIcon({ avatarUrl }: { avatarUrl: string }) {
  const theme = useCustomTheme();
  // PCA test ProxyImage
  return (
    <div
      style={{
        background: theme.custom.colors.avatarIconBackground,
        width: "28px",
        height: "28px",
        borderRadius: "14px",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <ProxyImage
        src={avatarUrl}
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "12px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      />
    </div>
  );
}

function AddAnotherAccountButton() {
  const classes = useStyles();
  return (
    <Button
      disableRipple
      style={{
        padding: 0,
        marginBottom: "8px",
        marginTop: "24px",
        display: "flex",
        textTransform: "none",
      }}
      className={classes.addAccountButton}
      onClick={() => {
        openAddUserAccount();
      }}
    >
      <Add
        style={{
          marginLeft: "10px",
          marginRight: "10px",
          color: "inherit",
        }}
      />
      <Typography
        style={{
          fontSize: "16px",
          color: "inherit",
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        Add Another Account
      </Typography>
    </Button>
  );
}
