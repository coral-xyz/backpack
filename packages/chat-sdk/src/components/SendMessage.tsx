import { useEffect, useState } from "react";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { Carousel } from "@giphy/react-components";
import GifIcon from "@mui/icons-material/Gif";
import SendIcon from "@mui/icons-material/Send";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";
import { IconButton, TextField } from "@mui/material";
import { createStyles, makeStyles } from "@mui/styles";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { v4 as uuidv4 } from "uuid";

import { useChatContext } from "./ChatContext";
import { ReplyContainer } from "./ReplyContainer";

// use @giphy/js-fetch-api to fetch gifs, instantiate with your api key
const gf = new GiphyFetch("SjZwwCn1e394TKKjrMJWb2qQRNcqW8ro");
const fetchGifs = (offset: number) => gf.trending({ offset, limit: 10 });

const useStyles = makeStyles((theme: any) =>
  createStyles({
    outerDiv: {
      padding: 10,
      background: theme.custom.colors.textBackground,
      backdropFilter: "blur(6px)",
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
          border: (props) => theme.custom.colors.textInputBorderFocussed,
          outline: "none",
        },
        "& fieldset": {
          border: (props) => theme.custom.colors.textInputBorderFull,
        },
        "&:hover fieldset": {
          border: (props) => theme.custom.colors.textInputBorderHovered,
        },
        "&.Mui-focused fieldset": {
          border: (props) => theme.custom.colors.textInputBorderFocussed,
        },
        "&:active": {
          outline: "none",
        },
        outline: "none",
      },
    },
  })
);

export const SendMessage = ({ messageRef }: any) => {
  const classes = useStyles();
  const [messageContent, setMessageContent] = useState("");
  const [emojiPicker, setEmojiPicker] = useState(false);
  const [gifPicker, setGifPicker] = useState(false);
  const {
    chatManager,
    setChats,
    userId,
    username,
    activeReply,
    setActiveReply,
    isDarkMode,
    type,
    remoteUsername,
  } = useChatContext();

  const sendMessage = (messageTxt, messageKind: "text" | "gif" = "text") => {
    if (chatManager && messageTxt) {
      setActiveReply({
        parent_username: "",
        parent_client_generated_uuid: null,
        text: "",
      });
      const client_generated_uuid = uuidv4();
      chatManager?.send(
        messageTxt,
        client_generated_uuid,
        messageKind,
        activeReply.parent_client_generated_uuid
          ? activeReply.parent_client_generated_uuid
          : undefined
      );
      setChats((x) => [
        ...x,
        {
          message: messageTxt,
          client_generated_uuid,
          received: false,
          uuid: userId,
          message_kind: messageKind,
          username,
          image: `https://avatars.xnfts.dev/v1/${username}`,
          parent_client_generated_uuid:
            activeReply.parent_client_generated_uuid,
          parent_message_author_uuid: activeReply.parent_message_author_uuid,
          parent_message_text: activeReply.text,
          parent_message_author_username: activeReply.parent_username,
        },
      ]);
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
              <IconButton>
                {" "}
                <SentimentVerySatisfiedIcon
                  className={classes.icon}
                  onClick={() => setEmojiPicker((x) => !x)}
                />{" "}
              </IconButton>
              <IconButton>
                {" "}
                <GifIcon
                  className={classes.icon}
                  onClick={(e) => {
                    setGifPicker((x) => !x);
                  }}
                />{" "}
              </IconButton>
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
      {emojiPicker && (
        <EmojiPicker
          theme={isDarkMode ? Theme.DARK : Theme.LIGHT}
          height={400}
          width={"100%"}
          onEmojiClick={(e) => setMessageContent((x) => x + e.emoji)}
        />
      )}
      {gifPicker && (
        <>
          {/*
             //@ts-ignore*/}
          <Carousel
            onGifClick={(x, e) => {
              sendMessage(x.id, "gif");
              setGifPicker(false);
              e.preventDefault();
            }}
            gifHeight={200}
            gutter={6}
            fetchGifs={fetchGifs}
          />
        </>
      )}
    </div>
  );
};
