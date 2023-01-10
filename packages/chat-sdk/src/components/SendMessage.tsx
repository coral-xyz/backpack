import { useEffect, useState } from "react";
import { CHAT_MESSAGES } from "@coral-xyz/common";
import { createEmptyFriendship, SignalingManager } from "@coral-xyz/db";
import { useUser } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import ArrowForwardIos from "@mui/icons-material/ArrowForwardIos";
import { IconButton, TextField } from "@mui/material";
import { createStyles, makeStyles } from "@mui/styles";
import { v4 as uuidv4 } from "uuid";

import { useChatContext } from "./ChatContext";
import { EmojiPickerComponent } from "./EmojiPicker";
import { GifPicker } from "./GifPicker";
import { ReplyContainer } from "./ReplyContainer";

const useStyles = makeStyles((theme: any) =>
  createStyles({
    outerDiv: {
      padding: 2,
      background: theme.custom.colors.textInputBackground,
      backdropFilter: "blur(6px)",
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
    },
    text: {
      color: theme.custom.colors.fontColor2,
    },
    wrapText: {
      width: "100%",
    },
    textFieldRoot: {
      color: theme.custom.colors.secondary,
      "& .MuiOutlinedInput-root": {
        padding: 0,
        "border-top-right-radius": 10,
        "border-top-left-radius": 10,
        "& fieldset": {
          border: "none",
        },
      },
      "& .MuiInputBase-input": {
        padding: "10px 12px 10px 12px",
        fontSize: "15px",
      },
    },
    textFieldInputColorEmpty: {
      color: theme.custom.colors.textPlaceholder,
    },
    textFieldInputColor: {
      color: theme.custom.colors.fontColor2,
    },
    icon: {
      color: theme.custom.colors.icon,
    },
    textInputRoot: {
      "border-top-right-radius": 10,
      "border-top-left-radius": 10,
      color: theme.custom.colors.fontColor2,
      fontWeight: 500,
      borderRadius: "12px",
      fontSize: "16px",
      lineHeight: "24px",
      "& .MuiOutlinedInput-root": {
        "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
          outline: "none",
        },
        "&:active": {
          outline: "none",
        },
        outline: "none",
      },
    },
  })
);

export const SendMessage = () => {
  const classes = useStyles();
  const { uuid } = useUser();
  const [messageContent, setMessageContent] = useState("");
  const [emojiPicker, setEmojiPicker] = useState(false);
  const [gifPicker, setGifPicker] = useState(false);
  const [emojiMenuOpen, setEmojiMenuOpen] = useState(false);
  const theme = useCustomTheme();

  const {
    remoteUserId,
    roomId,
    activeReply,
    setActiveReply,
    type,
    remoteUsername,
    chats,
  } = useChatContext();

  const sendMessage = (messageTxt, messageKind: "text" | "gif" = "text") => {
    if (messageTxt) {
      const client_generated_uuid = uuidv4();
      if (chats.length === 0 && type === "individual") {
        // If it's the first time the user is interacting,
        // create an in memory friendship
        createEmptyFriendship(uuid, remoteUserId, {
          last_message_sender: uuid,
          last_message_timestamp: new Date().toISOString(),
          last_message: messageKind === "gif" ? "GIF" : messageTxt,
          last_message_client_uuid: client_generated_uuid,
        });
      }
      setActiveReply({
        parent_username: "",
        parent_client_generated_uuid: null,
        text: "",
      });
      SignalingManager.getInstance()?.send({
        type: CHAT_MESSAGES,
        payload: {
          messages: [
            {
              client_generated_uuid: client_generated_uuid,
              message: messageTxt,
              message_kind: messageKind,
              parent_client_generated_uuid:
                activeReply.parent_client_generated_uuid
                  ? activeReply.parent_client_generated_uuid
                  : undefined,
            },
          ],
          type: type,
          room: roomId,
        },
      });
      setMessageContent("");
    }
  };

  useEffect(() => {
    function keyDownTextField(event) {
      if (event.key === "Enter") {
        event.preventDefault();
        sendMessage(messageContent);
        setEmojiPicker(false);
      }
      if (event.key === "Escape") {
        event.preventDefault();
        setEmojiPicker(false);
        setGifPicker(false);
      }
    }

    document.addEventListener("keydown", keyDownTextField);

    return () => {
      document.removeEventListener("keydown", keyDownTextField);
    };
  });
  return (
    <div className={classes.outerDiv}>
      {activeReply.parent_client_generated_uuid && (
        <ReplyContainer
          marginBottom={6}
          parent_username={activeReply.parent_username || ""}
          showCloseBtn={true}
          text={activeReply.text}
        />
      )}
      <div style={{ display: "flex" }}>
        <>
          {emojiMenuOpen ? (
            <div style={{ display: "flex" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              ></div>
              <EmojiPickerComponent
                setEmojiPicker={setEmojiPicker}
                emojiPicker={emojiPicker}
                setGifPicker={setGifPicker}
                setMessageContent={setMessageContent}
                buttonStyle={{
                  height: "28px",
                }}
              />
              <GifPicker
                sendMessage={sendMessage}
                setGifPicker={setGifPicker}
                gifPicker={gifPicker}
                setEmojiPicker={setEmojiPicker}
                buttonStyle={{
                  height: "28px",
                }}
              />
              {/*<IconButton>*/}
              {/*  {" "}*/}
              {/*  <SendIcon*/}
              {/*    className={classes.icon}*/}
              {/*    onClick={() => sendMessage(messageContent)}*/}
              {/*  />{" "}*/}
              {/*</IconButton>*/}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <IconButton
                size={"small"}
                style={{ color: theme.custom.colors.icon }}
                onClick={(e) => {
                  setEmojiMenuOpen(true);
                }}
              >
                <ArrowForwardIos
                  style={{
                    height: "18px",
                    color: theme.custom.colors.icon,
                    fontSize: 20,
                  }}
                />
              </IconButton>
            </div>
          )}
        </>
        <TextField
          classes={{
            root: classes.textFieldRoot,
          }}
          inputProps={{
            className: `${
              messageContent
                ? classes.textFieldInputColor
                : classes.textFieldInputColorEmpty
            }`,
          }}
          fullWidth={true}
          className={`${classes.textInputRoot} ${
            messageContent
              ? classes.textFieldInputColor
              : classes.textFieldInputColorEmpty
          }`}
          placeholder={
            type === "individual"
              ? `Message @${remoteUsername}`
              : "Your message ..."
          }
          value={messageContent}
          id="standard-text"
          onChange={(e) => setMessageContent(e.target.value)}
          onClick={() => setEmojiMenuOpen(false)}
        />
      </div>
    </div>
  );
};
