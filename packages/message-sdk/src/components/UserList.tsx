import {
  sendFriendRequest,
  unFriend,
} from "@coral-xyz/app-extension/src/api/friendship";
import type {
  RemoteUserData} from "@coral-xyz/common";
import {
  NAV_COMPONENT_MESSAGE_PROFILE
} from "@coral-xyz/common";
import { updateFriendshipIfExists } from "@coral-xyz/db";
import {
  isFirstLastListItemStyle,
  PrimaryButton,
  ProxyImage,
} from "@coral-xyz/react-common";
import { useUser } from "@coral-xyz/recoil";
// import { useNavigation } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { List, ListItem } from "@mui/material";

import { ParentCommunicationManager } from "../ParentCommunicationManager";

import { useStyles } from "./styles";

export const UserList = ({ users }: { users: RemoteUserData[] }) => {
  const theme = useCustomTheme();

  return (
    <List
      style={{
        paddingTop: 0,
        paddingBottom: 0,
        borderRadius: "14px",
        border: `${theme.custom.colors.borderFull}`,
      }}
    >
      {users.map((user, index) => (
        <UserListItem
          key={user.id}
          user={user}
          isFirst={index === 0}
          isLast={index === users.length - 1}
        />
      ))}
    </List>
  );
};

function UserListItem({
  user,
  isFirst,
  isLast,
}: {
  user: RemoteUserData;
  isFirst: boolean;
  isLast: boolean;
}) {
  const theme = useCustomTheme();
  const classes = useStyles();
  const { uuid } = useUser();
  return (
    <ListItem
      button
      disableRipple
      onClick={() => {
        ParentCommunicationManager.getInstance().push({
          title: `@${user.username}`,
          componentId: NAV_COMPONENT_MESSAGE_PROFILE,
          componentProps: {
            userId: user.id,
          },
        });
      }}
      style={{
        paddingLeft: "12px",
        paddingRight: "12px",
        paddingTop: "8px",
        paddingBottom: "8px",
        display: "flex",
        height: "48px",
        backgroundColor: theme.custom.colors.nav,
        borderBottom: isLast
          ? undefined
          : `solid 1pt ${theme.custom.colors.border}`,
        ...isFirstLastListItemStyle(isFirst, isLast, 12),
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div
          className={classes.hoverParent}
          style={{ flex: 1, display: "flex", justifyContent: "space-between" }}
        >
          <div style={{ display: "flex" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <UserIcon image={user.image} />
            </div>
            <div className={classes.userText}>{user.username}</div>
          </div>
          <div>
            <div
              onClick={async () => {
                if (user.areFriends) {
                  await unFriend({ to: user.id });
                  await updateFriendshipIfExists(uuid, user.id, {
                    areFriends: 0,
                    requested: 0,
                  });
                } else if (user.requested) {
                  await sendFriendRequest({ to: user.id, sendRequest: false });
                  await updateFriendshipIfExists(uuid, user.id, {
                    requested: 0,
                  });
                } else if (user.remoteRequested) {
                  await sendFriendRequest({ to: user.id, sendRequest: true });
                  await updateFriendshipIfExists(uuid, user.id, {
                    requested: 0,
                    areFriends: 1,
                  });
                } else {
                  await sendFriendRequest({ to: user.id, sendRequest: true });
                  await updateFriendshipIfExists(uuid, user.id, {
                    requested: 1,
                  });
                }
              }}
            >
              {user.areFriends
                ? "Unfriend"
                : user.requested
                ? "Cancel Request"
                : user.remoteRequested
                ? "Accept Request"
                : "Send Request"}{" "}
            </div>
            q
          </div>
        </div>
      </div>
    </ListItem>
  );
}

function UserIcon({ image }: any) {
  const classes = useStyles();
  return <ProxyImage src={image} className={classes.iconCircular} />;
}
