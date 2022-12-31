import React, { useCallback, useEffect, useState } from "react";
import { NAV_COMPONENT_MESSAGE_PROFILE } from "@coral-xyz/common";
import { useNavigation, useUser } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { Gif as GifComponent } from "@giphy/react-components";
import { Skeleton } from "@mui/material";
import { createStyles, makeStyles } from "@mui/styles";

import { useChatContext } from "./ChatContext";
import { ReplyIcon } from "./Icons";
import { ReplyContainer } from "./ReplyContainer";
// use @giphy/js-fetch-api to fetch gifs, instantiate with your api key
const gf = new GiphyFetch("SjZwwCn1e394TKKjrMJWb2qQRNcqW8ro");

const useStyles = makeStyles((theme: any) =>
  createStyles({
    messageRow: {
      display: "flex",
    },
    messageContainer: {
      position: "relative",
      marginLeft: "10px",
      marginBottom: "10px",
      width: "100%",
      textAlign: "left",
      fontSize: "14px",
      color: theme.custom.colors.fontColor2,
    },
    messageContent: {
      padding: 0,
      margin: 0,
    },
    messageTimeStampRight: {
      fontSize: ".85em",
      fontWeight: "300",
    },
    avatar: {
      width: theme.spacing(4),
      height: theme.spacing(4),
      borderRadius: "4px",
      cursor: "pointer",
    },
    messageLine: {
      display: "flex",
      justifyContent: "space-between",
      width: "100%",
      color: theme.custom.colors.fontColor2,
    },
    avatarNothing: {
      color: "transparent",
      backgroundColor: "transparent",
      width: theme.spacing(4),
      height: theme.spacing(4),
    },
    displayName: {
      marginLeft: "10px",
      fontSize: "12px",
      fontColor: "#4E5768",
    },
    messageLeftContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-start",
      padding: "8px 19px",
    },
    messageLeft: {
      borderRadius: "16px 16px 16px 0px",
      color: theme.custom.colors.fontColor4,
      overflowWrap: "break-word",
      fontSize: 14,
    },
    messageRightContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      padding: "8px 16px",
    },
    messageRight: {
      borderRadius: "16px 16px 0px 16px",
      color: theme.custom.colors.background,
      overflowWrap: "break-word",
      fontSize: 14,
    },
    hoverParent: {
      "&:hover $hoverChild, & .Mui-focused $hoverChild": {
        visibility: "visible",
      },
    },
    hoverChild: {
      visibility: "hidden",
    },
  })
);

const GifDemo = ({
  id,
  width,
  height,
  noLink,
  borderRadius,
  overlay,
  ...other
}: any) => {
  const [gif, setGif] = useState<any>();

  const fetch = useCallback(async () => {
    const { data: gif } = await gf.gif(id);
    setGif(gif);
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch, id]);

  return gif ? (
    <GifComponent
      onGifClick={(_, e) => e.preventDefault()}
      key={`gif-${noLink}`}
      tabIndex={1}
      borderRadius={borderRadius}
      gif={gif}
      width={width}
      height={height}
      noLink={noLink}
      overlay={overlay}
      {...other}
    />
  ) : null;
};

export const MessageLine = (props) => {
  const { push } = useNavigation();
  const message = props.message ? props.message : "";
  const timestamp = props.timestamp
    ? new Date(parseInt(props.timestamp))
    : new Date();
  const { uuid } = useUser();

  const photoURL = props.image;
  const displayName = props.username;
  const classes = useStyles();

  function formatAMPM(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return hours + ":" + minutes + " " + ampm;
  }

  const openProfilePage = (props: { uuid: string }) => {
    if (uuid === props.uuid) {
      return;
    }
    push({
      title: `@${displayName}`,
      componentId: NAV_COMPONENT_MESSAGE_PROFILE,
      componentProps: {
        userId: props.uuid,
      },
    });
  };

  return (
    <>
      <div className={classes.messageRow}>
        {photoURL ? (
          <img
            onClick={() => openProfilePage({ uuid: props.uuid })}
            alt={displayName}
            className={classes.avatar}
            src={photoURL}
          ></img>
        ) : (
          <Skeleton variant="circular" width={40} height={40} />
        )}
        <div className={classes.messageLine}>
          <div>
            <div
              onClick={() => openProfilePage({ uuid: props.uuid })}
              className={classes.displayName}
              style={{ color: props.color, cursor: "pointer" }}
            >
              {displayName ? (
                `@${displayName}`
              ) : (
                <Skeleton width={30} height={20} style={{ marginTop: "0px" }} />
              )}
            </div>
            <div className={classes.messageContainer}>
              <div>
                <p className={classes.messageContent}>
                  {props.messageKind === "gif" ? (
                    <GifDemo id={message} width={300} />
                  ) : (
                    message
                  )}
                </p>
              </div>
            </div>
          </div>
          <div>
            <div className={classes.messageTimeStampRight}>
              {formatAMPM(timestamp)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export function ChatMessages() {
  const { chats, userId } = useChatContext();
  const theme = useCustomTheme();
  return (
    <div style={{ padding: 5 }}>
      {chats.map((chat) => {
        return (
          <MessageLine
            color={chat.color || theme.custom.colors.fontColor2}
            timestamp={chat.created_at}
            key={chat.client_generated_uuid}
            message={chat.message}
            received={chat.received}
            messageKind={chat.message_kind}
            image={chat.image}
            username={chat.username}
            uuid={chat.uuid}
          />
        );
      })}
    </div>
  );

  return (
    <div>
      {chats.map((chat) => {
        if (chat.uuid !== userId) {
          return (
            <>
              <MessageLeft
                timestamp={chat.created_at}
                key={chat.client_generated_uuid}
                message={chat.message}
                received={chat.received}
                messageKind={chat.message_kind}
                image={chat.image}
                username={chat.username}
                userId={chat.uuid}
                client_generated_uuid={chat.client_generated_uuid}
                parent_message_text={chat.parent_message_text}
                parent_message_author_username={
                  "" //TODO: Flow this from userDB
                }
                parent_message_author_uuid={chat.parent_message_author_uuid}
              />
            </>
          );
        }
        return (
          <MessageRight
            timestamp={chat.created_at}
            key={chat.client_generated_uuid}
            message={chat.message}
            received={chat.received}
            userId={chat.uuid}
            messageKind={chat.message_kind}
            image={chat.image}
            username={chat.username}
            client_generated_uuid={chat.client_generated_uuid}
            parent_message_text={chat.parent_message_text}
            parent_message_author_username={""} // TODO: Flow this from user index db
            parent_message_author_uuid={chat.parent_message_author_uuid}
          />
        );
      })}
    </div>
  );
}

function MessageLeft(props) {
  const classes = useStyles();
  const message = props.message ? props.message : "";
  const theme = useCustomTheme();
  const { setActiveReply } = useChatContext();

  return (
    <>
      {props.parent_message_author_uuid && (
        <div style={{ paddingLeft: 19, marginBottom: -10 }}>
          <ReplyContainer
            marginBottom={0}
            parent_username={props.parent_message_author_username || ""}
            showCloseBtn={false}
            text={props.parent_message_text}
          />
        </div>
      )}
      <div className={`${classes.messageLeftContainer} ${classes.hoverParent}`}>
        <div
          className={classes.messageLeft}
          style={{
            maxWidth: props.messageKind === "gif" ? 250 : 200,
            background:
              props.messageKind === "gif"
                ? "transparent"
                : theme.custom.colors.bg4,
            padding: props.messageKind === "gif" ? "0px 0px" : "8px 16px",
          }}
        >
          {props.messageKind === "gif" ? (
            <GifDemo id={message} width={250} />
          ) : (
            message
          )}
        </div>
        {props.messageKind !== "gif" && (
          <div
            style={{ marginLeft: 10, marginTop: 10, cursor: "pointer" }}
            className={classes.hoverChild}
            onClick={() => {
              setActiveReply({
                parent_client_generated_uuid: props.client_generated_uuid,
                text: message,
                parent_username: `@${props.username}`,
                parent_message_author_uuid: props.userId,
              });
            }}
          >
            <ReplyIcon fill={theme.custom.colors.icon} />
          </div>
        )}
      </div>
    </>
  );
}

function MessageRight(props) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const { setActiveReply } = useChatContext();
  const message = props.message ? props.message : "";

  return (
    <>
      {props.parent_message_author_uuid && (
        <div style={{ paddingLeft: 19, marginBottom: -10 }}>
          <ReplyContainer
            align={"right"}
            marginBottom={0}
            parent_username={props.parent_message_author_username || ""}
            showCloseBtn={false}
            text={props.parent_message_text}
          />
        </div>
      )}
      <div className={`${classes.messageRightContainer}`}>
        <div
          className={`${classes.hoverParent}`}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
          }}
        >
          {props.messageKind !== "gif" && (
            <div
              style={{ marginRight: 10, marginTop: 10, cursor: "pointer" }}
              className={classes.hoverChild}
              onClick={() => {
                setActiveReply({
                  parent_client_generated_uuid: props.client_generated_uuid,
                  text: message,
                  parent_message_author_uuid: props.userId,
                  parent_username: "Yourself",
                });
              }}
            >
              <ReplyIcon fill={theme.custom.colors.icon} />
            </div>
          )}
          <div
            className={classes.messageRight}
            style={{
              maxWidth: props.messageKind === "gif" ? 250 : 200,
              background:
                props.messageKind === "gif"
                  ? "transparent"
                  : theme.custom.colors.fontColor2,
              padding: props.messageKind === "gif" ? "0px 0px" : "8px 16px",
            }}
          >
            {props.messageKind === "gif" ? (
              <GifDemo id={message} width={250} />
            ) : (
              message
            )}
          </div>
        </div>
      </div>
    </>
  );
}
