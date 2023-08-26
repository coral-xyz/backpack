import { useLocation } from "react-router-dom";
import { useUsersMetadata } from "@coral-xyz/chat-xplat";
import {
  BACKPACK_TEAM,
  type CollectionChatData,
  type EnrichedInboxDb,
  formatAmPm,
  NAV_COMPONENT_MESSAGE_CHAT,
  NAV_COMPONENT_MESSAGE_GROUP_CHAT,
  NAV_COMPONENT_MESSAGE_PROFILE,
  NAV_COMPONENT_MESSAGE_REQUESTS,
  parseMessage,
  type SubscriptionType,
} from "@coral-xyz/common";
import {
  BackpackStaffIcon,
  isFirstLastListItemStyle,
  LocalImage,
} from "@coral-xyz/react-common";
import { useDecodedSearchParams } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import MarkChatUnreadIcon from "@mui/icons-material/MarkChatUnread";
import VerifiedIcon from "@mui/icons-material/Verified";
import { List, ListItem } from "@mui/material";

import { ParentCommunicationManager } from "../ParentCommunicationManager";

import { useStyles } from "./styles";

export const MessageList = ({
  activeChats,
  requestCount = 0,
  toRoot = true,
}: {
  activeChats: (
    | { chatType: "individual"; chatProps: EnrichedInboxDb }
    | { chatType: "collection"; chatProps: CollectionChatData }
  )[];
  requestCount?: number;
  toRoot?: boolean;
}) => {
  const theme = useCustomTheme();

  const sortedChats = activeChats.sort(
    (a, b) =>
      new Date(
        (b.chatType === "collection"
          ? b.chatProps.lastMessageTimestamp
          : b.chatProps.last_message_timestamp) ?? 0
      ).getTime() -
      new Date(
        (a.chatType === "collection"
          ? a.chatProps.lastMessageTimestamp
          : a.chatProps.last_message_timestamp) ?? 0
      ).getTime()
  );

  return (
    <List
      style={{
        paddingTop: 0,
        paddingBottom: 0,
        borderRadius: "14px",
        border: `${theme.custom.colors.borderFull}`,
      }}
    >
      {requestCount > 0 ? (
        <RequestsChatItem
          requestCount={requestCount}
          isFirst
          isLast={activeChats?.length === 0}
        />
      ) : null}
      {sortedChats?.map((activeChat, index) => (
        <ChatListItem
          toRoot={toRoot}
          type={activeChat.chatType}
          image={
            activeChat.chatType === "individual"
              ? activeChat.chatProps.remoteUserImage!
              : activeChat.chatProps.image!
          }
          userId={
            activeChat.chatType === "individual"
              ? activeChat.chatProps.remoteUserId!
              : ""
          }
          name={
            activeChat.chatType === "individual"
              ? activeChat.chatProps.remoteUsername!
              : activeChat.chatProps.name!
          }
          id={
            activeChat.chatType === "individual"
              ? activeChat.chatProps.remoteUserId
              : activeChat.chatProps.collectionId
          }
          message={
            activeChat.chatType === "individual"
              ? activeChat.chatProps.last_message!
              : activeChat.chatProps.lastMessage!
          }
          timestamp={
            activeChat.chatType === "individual"
              ? activeChat.chatProps.last_message_timestamp || ""
              : activeChat.chatProps.lastMessageTimestamp || ""
          }
          isFirst={requestCount === 0 ? index === 0 : false}
          isLast={index === activeChats?.length - 1}
          isUnread={
            activeChat.chatType === "individual"
              ? activeChat.chatProps.unread
                ? true
                : false
              : activeChat.chatProps.lastMessageUuid !==
                activeChat.chatProps.lastReadMessage
          }
        />
      ))}
    </List>
  );
};

export function ChatListItem({
  type,
  image,
  name,
  message,
  timestamp,
  isFirst,
  isLast,
  id,
  isUnread,
  toRoot,
  userId,
}: {
  type: SubscriptionType;
  image: string;
  name: string;
  message: string;
  timestamp: string;
  isFirst: boolean;
  isLast: boolean;
  id: string;
  isUnread: boolean;
  toRoot: boolean;
  userId: string;
}) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const { props }: any = useDecodedSearchParams();
  const parts = parseMessage(message || "");
  const pathname = useLocation().pathname;
  const users: any = useUsersMetadata({
    remoteUserIds: parts.filter((x) => x.type === "tag").map((x) => x.value),
  });
  const printText = parts
    .map((x) => (x.type === "tag" ? users[x.value]?.username : x.value))
    .join("");

  let messagePreview = "";
  if (printText) {
    messagePreview =
      printText.length > 25 ? printText.substring(0, 22) + "..." : printText;
  }

  return (
    <ListItem
      button
      disableRipple
      onClick={() => {
        ParentCommunicationManager.getInstance().push({
          title: type === "individual" ? `@${name}` : name,
          componentId:
            type === "individual"
              ? NAV_COMPONENT_MESSAGE_CHAT
              : NAV_COMPONENT_MESSAGE_GROUP_CHAT,
          componentProps: {
            userId: type === "individual" ? id : undefined,
            username: type === "individual" ? name : undefined,
            id: id,
            fromInbox: true,
            image,
          },
          pushAboveRoot: toRoot,
        });
      }}
      style={{
        padding: "10px",
        paddingLeft: "16px",
        paddingRight: "16px",
        display: "flex",
        height: "72px",
        backgroundColor:
          (pathname === "/messages/chat" && props.userId === id) ||
          (pathname === "/messages/groupchat" && props.id === id)
            ? theme.custom.colors.bg4
            : isUnread
            ? theme.custom.colors.unreadBackground
            : theme.custom.colors.nav,
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
              <UserIcon
                onClick={() => {
                  if (type === "collection") {
                    return;
                  }
                  ParentCommunicationManager.getInstance().push({
                    title: `@${name}`,
                    componentId: NAV_COMPONENT_MESSAGE_PROFILE,
                    componentProps: {
                      userId: id,
                    },

                    pushAboveRoot: toRoot,
                  });
                }}
                image={image}
              />
            </div>
            <div>
              <div
                className={classes.userTextSmall}
                style={{
                  display: "flex",
                  fontWeight: isUnread ? 700 : 600,
                  color: isUnread
                    ? theme.custom.colors.fontColor
                    : theme.custom.colors.smallTextColor,
                }}
              >
                <div>{type === "individual" ? `@${name}` : name}</div>
                {id === "backpack-chat" ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      flexDirection: "column",
                    }}
                  >
                    <VerifiedIcon
                      style={{
                        fontSize: 14,
                        marginLeft: 3,
                        color: theme.custom.colors.verified,
                      }}
                    />
                  </div>
                ) : null}
                {BACKPACK_TEAM.includes(userId) ? <BackpackStaffIcon /> : null}
              </div>
              <div
                className={classes.userTextSmall}
                style={{
                  wordBreak: "break-all",
                  fontWeight: 500,
                  color: isUnread
                    ? theme.custom.colors.fontColor
                    : theme.custom.colors.smallTextColor,
                }}
              >
                {messagePreview}
              </div>
            </div>
          </div>
          <div
            className={classes.timestamp}
            style={{
              textAlign: "right",
              minWidth: "63px",
              fontWeight: isUnread ? 700 : 500,
              color: isUnread
                ? theme.custom.colors.fontColor
                : theme.custom.colors.smallTextColor,
            }}
          >
            {formatAmPm(new Date(timestamp))}
          </div>
        </div>
      </div>
    </ListItem>
  );
}

export function RequestsChatItem({
  requestCount,
  isFirst,
  isLast,
}: {
  requestCount: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  const classes = useStyles();
  const theme = useCustomTheme();

  return (
    <ListItem
      button
      disableRipple
      onClick={() => {
        ParentCommunicationManager.getInstance().push({
          title: `Requests`,
          componentId: NAV_COMPONENT_MESSAGE_REQUESTS,
          componentProps: {},
          pushAboveRoot: true,
        });
      }}
      style={{
        padding: "10px",
        paddingLeft: "16px",
        paddingRight: "16px",
        display: "flex",
        height: "80px",
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
              <div
                style={{
                  width: 40,
                  height: 40,
                  padding: 10,
                  background: theme.custom.colors.background,
                  borderRadius: 20,
                  display: "flex",
                  justifyContent: "center",
                  marginRight: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                  }}
                >
                  <MarkChatUnreadIcon
                    style={{ color: theme.custom.colors.icon, width: 18 }}
                  />
                </div>
              </div>
            </div>
            <div>
              <div
                className={classes.userTextSmall}
                style={{ fontWeight: 600 }}
              >
                Message requests
              </div>
              <div className={classes.userTextSmall}>
                {requestCount === 1 ? "1 person" : `${requestCount} people`} you
                may know
              </div>
            </div>
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
      size={40}
      style={{ width: 40, height: 40 }}
      src={image}
      className={classes.iconCircularBig}
    />
  );
}
