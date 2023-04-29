import { useState } from "react";
import type { EnrichedInboxDb } from "@coral-xyz/common";
import {
  NAV_COMPONENT_MESSAGE_PROFILE,
  usernameDisplay,
} from "@coral-xyz/common";
import { useContacts } from "@coral-xyz/db";
import {
  BubbleTopLabel,
  isFirstLastListItemStyle,
  LocalImage,
  TextInput,
} from "@coral-xyz/react-common";
import { useNavigation, useUser } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import SearchIcon from "@mui/icons-material/Search";
import { List, ListItem } from "@mui/material";

import { useStyles } from "./styles";

export const FriendsScreen = ({ userId }) => {
  const { push } = useNavigation();

  const { uuid } = useUser();
  const classes = useStyles();
  const theme = useCustomTheme();
  const [searchFilter, setSearchFilter] = useState("");

  const allChatsOfLoggedInUser = useContacts(uuid);
  const friendsOfLoggedInUser = allChatsOfLoggedInUser.filter(
    (x: any) => x.areFriends === 1
  );

  const filteredFriendsOfLoggedInUser = friendsOfLoggedInUser
    .filter((x: EnrichedInboxDb) => x.remoteUsername.includes(searchFilter))
    .map((x: EnrichedInboxDb) => ({
      image: x.remoteUserImage,
      id: x.remoteUserId,
      username: x.remoteUsername,
      areFriends: x.areFriends ? true : false,
      requested: x.requested ? true : false,
      remoteRequested: x.remoteRequested ? true : false,
    }));

  const allChatsOfOtherUser = useContacts(userId);
  const friendsOfOtherUser = allChatsOfOtherUser.filter(
    (x: any) => x.areFriends === 1
  );

  const filteredFriendsOfOtherUser = friendsOfOtherUser
    .filter((x: EnrichedInboxDb) => x.remoteUsername.includes(searchFilter))
    .map((x: EnrichedInboxDb) => ({
      image: x.remoteUserImage,
      id: x.remoteUserId,
      username: x.remoteUsername,
      areFriends: x.areFriends ? true : false,
      requested: x.requested ? true : false,
      remoteRequested: x.remoteRequested ? true : false,
    }));

  const { mutualFriendsList, otherUserFriendsList } =
    findOtherUserFriendandMutualFriends(
      filteredFriendsOfLoggedInUser,
      filteredFriendsOfOtherUser
    );

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: 16,
      }}
    >
      <TextInput
        className={classes.searchField}
        placeholder="Search"
        startAdornment={
          <SearchIcon sx={{ color: theme.custom.colors.icon, mr: "10px" }} />
        }
        value={searchFilter}
        setValue={async (e) => {
          const prefix = e.target.value;
          setSearchFilter(prefix);
        }}
        inputProps={{
          style: {
            height: "48px",
          },
        }}
      />
      {mutualFriendsList?.length > 0 ? (
        <div style={{ marginTop: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <BubbleTopLabel
              text={mutualFriendsList?.length.toString() + " Mutual"}
            />
          </div>
          <div style={{ marginBottom: 15 }}>
            <UsersList
              classes={classes}
              theme={theme}
              push={push}
              users={mutualFriendsList ?? []}
              currUserId={uuid}
            />
          </div>
        </div>
      ) : (
        <div />
      )}
      {otherUserFriendsList.length > 0 ? (
        <div style={{ marginTop: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <BubbleTopLabel
              text={
                otherUserFriendsList?.length.toString() +
                (otherUserFriendsList?.length <= 1 ? " friend" : " friends")
              }
            />
          </div>
          <div style={{ marginBottom: 15 }}>
            <UsersList
              classes={classes}
              theme={theme}
              push={push}
              users={otherUserFriendsList ?? []}
              currUserId={uuid}
            />
          </div>
        </div>
      ) : (
        <div />
      )}
    </div>
  );
};

function UsersList({ theme, users, push, classes, currUserId }) {
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
        <ListItem
          key={user?.id}
          onClick={() => {
            currUserId !== user?.id &&
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
            cursor: currUserId !== user?.id ? "pointer" : "default",
            backgroundColor: theme.custom.colors.nav,
            borderBottom:
              index === users.length - 1
                ? undefined
                : `solid 1pt ${theme.custom.colors.border}`,
            ...isFirstLastListItemStyle(
              index === 0,
              index === users.length - 1,
              12
            ),
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
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <UserIcon image={user?.image} />
                </div>
                <div className={classes.userText} style={{ display: "flex" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      flexDirection: "column",
                    }}
                  >
                    {usernameDisplay(user.username, 15)}{" "}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ListItem>
      ))}
    </List>
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

const findOtherUserFriendandMutualFriends = (
  loggedInUserFriends,
  otherUserFriends
) => {
  // Find mutual friends
  const mutualFriendsList = loggedInUserFriends.filter((myFriend) =>
    otherUserFriends.some(
      (otherFriend) => otherFriend.username === myFriend.username
    )
  );

  // Find my own friends
  const otherUserFriendsList = otherUserFriends.filter(
    (otherFriend) =>
      !mutualFriendsList.some(
        (mutualFriend) => mutualFriend.username === otherFriend.username
      )
  );

  return { mutualFriendsList, otherUserFriendsList };
};
