import {
  EnrichedInboxDb,
  NAV_COMPONENT_MESSAGE_CHAT,
  NAV_COMPONENT_MESSAGE_PROFILE,
} from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import { List, ListItem } from "@mui/material";
import { isFirstLastListItemStyle } from "../../common";
import { useState } from "react";
import { useStyles } from "./styles";
import { ProxyImage } from "../../common/ProxyImage";
import { useNavigation } from "@coral-xyz/recoil";

export const MessageList = ({
  activeChats,
}: {
  activeChats: EnrichedInboxDb[];
}) => {
  const theme = useCustomTheme();
  const [chatModal, setChatModal] = useState(false);

  return (
    <>
      <List
        style={{
          paddingTop: 0,
          paddingBottom: 0,
          borderRadius: "14px",
          border: `${theme.custom.colors.borderFull}`,
        }}
      >
        {activeChats.map((activeChat, index) => (
          <ChatListItem
            image={
              activeChat.last_message_sender === activeChat.user1
                ? activeChat.user1Image
                : activeChat.user2Image
            }
            username={
              activeChat.last_message_sender === activeChat.user1
                ? activeChat.user1Username
                : activeChat.user2Username
            }
            userId={
              activeChat.last_message_sender === activeChat.user1
                ? activeChat.user1
                : activeChat.user2
            }
            message={activeChat.last_message}
            timestamp={activeChat.last_message_timestamp}
            isFirst={index === 0}
            isLast={index === activeChats.length - 1}
          />
        ))}
      </List>
    </>
  );
};

function ChatListItem({
  image,
  username,
  message,
  timestamp,
  isFirst,
  isLast,
  userId,
}: any) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const { push } = useNavigation();

  function formatAMPM(date: Date) {
    let hours = date.getHours();
    let minutes: string | number = date.getMinutes();
    let ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return hours + ":" + minutes + " " + ampm;
  }

  return (
    <ListItem
      button
      disableRipple
      onClick={() => {
        push({
          title: `@${username}`,
          componentId: NAV_COMPONENT_MESSAGE_CHAT,
          componentProps: {
            userId,
          },
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
              <UserIcon
                onClick={() => {
                  push({
                    title: `@${username}`,
                    componentId: NAV_COMPONENT_MESSAGE_PROFILE,
                    componentProps: {
                      userId,
                    },
                  });
                }}
                image={image}
              />
            </div>
            <div>
              <div className={classes.userTextSmall}>@{username}</div>
              <div className={classes.userTextSmall}>
                {message?.substr(0, 50) || ""}
              </div>
            </div>
          </div>
          <div className={classes.timestamp}>
            {formatAMPM(new Date(timestamp))}
          </div>
        </div>
      </div>
    </ListItem>
  );
}

function UserIcon({ image }: any) {
  const classes = useStyles();
  return <ProxyImage src={image} className={classes.iconCircularBig} />;
}
