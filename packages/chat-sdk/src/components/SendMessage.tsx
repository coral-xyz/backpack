import { useEffect, useState } from "react";
import { CHAT_MESSAGES } from "@coral-xyz/common";
import { createEmptyFriendship, SignalingManager } from "@coral-xyz/db";
import { useUser } from "@coral-xyz/recoil";
import SendIcon from "@mui/icons-material/Send";
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
      background: theme.custom.colors.textBackground,
      backdropFilter: "blur(6px)",
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
    },
    text: {
      color: theme.custom.colors.fontColor2,
    },
    wrapText: {
      width: "100%",
    },
    button: {
      //margin: theme.spacing(1),
    },
    textFieldRoot: {
      color: theme.custom.colors.secondary,
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          border: "none",
          color: theme.custom.colors.secondary,
        },
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
      color: theme.custom.colors.fontColor2,
      fontWeight: 500,
      borderRadius: "12px",
      fontSize: "16px",
      lineHeight: "24px",
      "& .MuiOutlinedInput-root": {
        background: theme.custom.colors.textBackground,
        borderRadius: "12px",
        "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
          border: () => theme.custom.colors.textInputBorderFocussed,
          outline: "none",
        },
        "& fieldset": {
          border: () => theme.custom.colors.textInputBorderFull,
        },
        "&:hover fieldset": {
          border: () => theme.custom.colors.textInputBorderHovered,
        },
        "&.Mui-focused fieldset": {
          border: () => theme.custom.colors.textInputBorderFocussed,
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
      <TextField
        classes={{
          root: classes.textFieldRoot,
        }}
        inputProps={{
          style: {
            padding: 12,
          },
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
        InputProps={{
          endAdornment: (
            <>
              <EmojiPickerComponent
                setEmojiPicker={setEmojiPicker}
                emojiPicker={emojiPicker}
                setGifPicker={setGifPicker}
                setMessageContent={setMessageContent}
              />
              <GifPicker
                sendMessage={sendMessage}
                setGifPicker={setGifPicker}
                gifPicker={gifPicker}
                setEmojiPicker={setEmojiPicker}
              />

              <IconButton>
                {" "}
                <SendIcon
                  className={classes.icon}
                  onClick={() => sendMessage(messageContent)}
                />{" "}
              </IconButton>
            </>
          ),
        }}
        onChange={(e) => setMessageContent(e.target.value)}
      />
    </div>
  );
};
