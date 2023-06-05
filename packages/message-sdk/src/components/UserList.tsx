import type { CSSProperties, MouseEvent } from "react";
import { SignalingManager } from "@coral-xyz/chat-xplat";
import type { RemoteUserData } from "@coral-xyz/common";
import {
  BACKPACK_TEAM,
  formatUsername,
  formatWalletAddress,
  NAV_COMPONENT_MESSAGE_PROFILE,
  sendFriendRequest,
  unFriend,
} from "@coral-xyz/common";
import { updateFriendshipIfExists } from "@coral-xyz/db";
import {
  BackpackStaffIcon,
  isFirstLastListItemStyle,
  LocalImage,
  UserAction,
} from "@coral-xyz/react-common";
import {
  useNavigation,
  useUpdateFriendships,
  useUser,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import VerifiedIcon from "@mui/icons-material/Verified";
import { List, ListItem } from "@mui/material";

import { useStyles } from "./styles";

export const UserList = ({
  users,
  setMembers,
  style,
  itemStyle,
}: {
  users: RemoteUserData[];
  setMembers?: React.Dispatch<React.SetStateAction<RemoteUserData[]>>;
  style?: CSSProperties;
  itemStyle?: CSSProperties;
}) => {
  const theme = useCustomTheme();

  return (
    <List
      style={{
        paddingTop: 0,
        paddingBottom: 0,
        borderRadius: "14px",
        border: `${theme.custom.colors.borderFull}`,
        ...style,
      }}
    >
      {users.map((user, index) => (
        <UserListItem
          key={index}
          user={user}
          isFirst={index === 0}
          isLast={index === users.length - 1}
          setMembers={setMembers}
          style={itemStyle}
        />
      ))}
    </List>
  );
};

function UserListItem({
  user,
  isFirst,
  isLast,
  setMembers,
  style,
}: {
  user: RemoteUserData;
  isFirst: boolean;
  isLast: boolean;
  setMembers?: React.Dispatch<React.SetStateAction<RemoteUserData[]>>;
  style?: CSSProperties;
}) {
  const theme = useCustomTheme();
  const { push } = useNavigation();
  const classes = useStyles();
  const { uuid } = useUser();
  const setFriendshipValue = useUpdateFriendships();

  const onUnfriend = async (ev: MouseEvent<HTMLDivElement>) => {
    ev.stopPropagation();
    await unFriend({ to: user.id });
    await updateFriendshipIfExists(uuid, user.id, {
      areFriends: 0,
      requested: 0,
    });
    setFriendshipValue({
      userId: user.id,
      friendshipValue: {
        requested: false,
        areFriends: false,
      },
    });
    setMembers?.((members) =>
      members.map((m) => {
        if (m.id === user.id) {
          return {
            ...m,
            areFriends: false,
            requested: false,
            remoteRequested: false,
          };
        }
        return m;
      })
    );
    SignalingManager.getInstance().onUpdateRecoil({
      type: "friendship",
    });
  };

  const onCancelRequest = async (ev: MouseEvent<HTMLDivElement>) => {
    ev.stopPropagation();
    await sendFriendRequest({ to: user.id, sendRequest: false });
    await updateFriendshipIfExists(uuid, user.id, {
      requested: 0,
    });

    setFriendshipValue({
      userId: user.id,
      friendshipValue: {
        requested: false,
      },
    });
    setMembers?.((members) =>
      members.map((m) => {
        if (m.id === user.id) {
          return {
            ...m,
            requested: false,
          };
        }
        return m;
      })
    );
    SignalingManager.getInstance().onUpdateRecoil({
      type: "friendship",
    });
  };

  const onAccept = async (ev: MouseEvent<HTMLDivElement>) => {
    ev.stopPropagation();
    await sendFriendRequest({ to: user.id, sendRequest: true });
    await updateFriendshipIfExists(uuid, user.id, {
      requested: 0,
      areFriends: 1,
    });

    setFriendshipValue({
      userId: user.id,
      friendshipValue: {
        requested: false,
        areFriends: true,
      },
    });
    setMembers?.((members) =>
      members.map((m) => {
        if (m.id === user.id) {
          return {
            ...m,
            requested: false,
            remoteRequested: false,
            areFriends: true,
          };
        }
        return m;
      })
    );
    SignalingManager.getInstance().onUpdateRecoil({
      type: "friendship",
    });
  };

  const onDecline = async (ev: MouseEvent<HTMLDivElement>) => {
    ev.stopPropagation();
    await sendFriendRequest({ to: user.id, sendRequest: false });
    await updateFriendshipIfExists(uuid, user.id, {
      requested: 0,
      areFriends: 0,
      remoteRequested: 0,
    });

    setFriendshipValue({
      userId: user.id,
      friendshipValue: {
        requested: false,
        areFriends: false,
        remoteRequested: false,
      },
    });
    setMembers?.((members) =>
      members.map((m) => {
        if (m.id === user.id) {
          return {
            ...m,
            requested: false,
            remoteRequested: false,
            areFriends: false,
          };
        }
        return m;
      })
    );
    SignalingManager.getInstance().onUpdateRecoil({
      type: "friendship",
    });
  };

  const onSendRequest = async (ev: MouseEvent<HTMLDivElement>) => {
    ev.stopPropagation();
    await sendFriendRequest({ to: user.id, sendRequest: true });
    await updateFriendshipIfExists(uuid, user.id, {
      requested: 1,
    });

    setFriendshipValue({
      userId: user.id,
      friendshipValue: {
        requested: true,
      },
    });
    setMembers?.((members) =>
      members.map((m) => {
        if (m.id === user.id) {
          return {
            ...m,
            requested: true,
          };
        }
        return m;
      })
    );
    SignalingManager.getInstance().onUpdateRecoil({
      type: "friendship",
    });
  };

  return (
    <ListItem
      button
      disableRipple
      onClick={() => {
        push({
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
        ...style,
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
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
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
            <div className={classes.userText} style={{ display: "flex" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                {formatUsername(user.username, 15)}{" "}
                {user.searchedSolPubKey ? (
                  <> ({formatWalletAddress(user.searchedSolPubKey, 2)})</>
                ) : (
                  ""
                )}{" "}
                {user.searchedEthPubKey ? (
                  <>({formatWalletAddress(user.searchedEthPubKey, 2)})</>
                ) : (
                  ""
                )}
              </div>
              {BACKPACK_TEAM.includes(user.id) ? <BackpackStaffIcon /> : null}
            </div>
          </div>
          <div>
            {user.areFriends ? (
              <UserAction text="Unfriend" onClick={onUnfriend} />
            ) : user.requested ? (
              <UserAction text="Cancel Request" onClick={onCancelRequest} />
            ) : user.remoteRequested ? (
              <div style={{ display: "flex", gap: 12 }}>
                <UserAction text="Decline" onClick={onDecline} />
                <UserAction
                  style={{ color: theme.custom.colors.blue }}
                  text="Accept"
                  onClick={onAccept}
                />
              </div>
            ) : (
              <UserAction text="Send Request" onClick={onSendRequest} />
            )}
          </div>
        </div>
      </div>
    </ListItem>
  );
}

function UserIcon({ image }: any) {
  const classes = useStyles();
  return (
    <LocalImage
      size={32}
      src={image}
      className={classes.iconCircular}
      style={{ width: 32, height: 32 }}
    />
  );
}
