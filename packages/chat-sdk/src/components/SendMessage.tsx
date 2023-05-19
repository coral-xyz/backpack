import { useEffect, useRef, useState } from "react";
import {
  useActiveSolanaWallet,
  useFeatureGates,
  useUser,
} from "@coral-xyz/recoil";
import { useUsersMetadata } from "@coral-xyz/chat-xplat";
import { useCustomTheme } from "@coral-xyz/themes";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { CircularProgress, IconButton } from "@mui/material";
import { createStyles, makeStyles } from "@mui/styles";

import { CustomAutoComplete, MessageInput } from "./messageInput/MessageInput";
import { MessageInputProvider } from "./messageInput/MessageInputProvider";
import { AboveMessagePluginRenderer } from "./AboveMessagePluginRenderer";
import { Attachment } from "./Attachment";
import { Barter } from "./Barter";
import { useChatContext } from "./ChatContext";
import { EmojiPickerComponent } from "./EmojiPicker";
import { GifPicker } from "./GifPicker";
import { NftSticker } from "./NftSticker";
import { ReplyContainer } from "./ReplyContainer";
import { SecureTransfer } from "./SecureTransfer";

const BARTER_ENABLED = true;
const SECURE_TRANSFER_ENABLED = false;

const useStyles = makeStyles((theme: any) =>
  createStyles({
    outerDiv: {
      padding: 2,
      background: theme.custom.colors.listItemHover,
      backdropFilter: "blur(6px)",
      borderRadius: 8,
      margin: 12,
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

export const SendMessage = ({
  uploadingFile,
  setUploadingFile,
  selectedFile,
  setSelectedFile,
  onMediaSelect,
  selectedMediaKind,
  uploadedImageUri,
  pluginMenuOpen,
  setPluginMenuOpen,
}: {
  onMediaSelect: any;
  selectedMediaKind: "video" | "image";
  uploadedImageUri: string;
  selectedFile: string;
  setSelectedFile: any;
  uploadingFile: boolean;
  setUploadingFile: any;
  pluginMenuOpen: boolean;
  setPluginMenuOpen: (val: boolean) => void;
}) => {
  const classes = useStyles();
  const { uuid } = useUser();
  const [emojiPicker, setEmojiPicker] = useState(false);
  const [gifPicker, setGifPicker] = useState(false);
  const featureGates = useFeatureGates();

  const theme = useCustomTheme();
  const activeSolanaWallet = useActiveSolanaWallet();
  const {
    setOpenPlugin,
    aboveMessagePlugin,
    setAboveMessagePlugin,
    inputRef,
    sendMessage,
    remoteUserId,
    remoteUsername,
    activeReply,
    type,
    chats,
  } = useChatContext();

  const remoteUsers = useUsersMetadata({ remoteUserIds: [remoteUserId] });
  const remoteUserImage = remoteUsers?.[0]?.image;

  useEffect(() => {
    function keyDownTextField(event) {
      if (event.key === "Enter") {
        event.preventDefault();
        sendMessage(inputRef.current.getTransformedValue());
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
  }, [
    inputRef,
    selectedFile,
    uploadedImageUri,
    selectedMediaKind,
    activeReply,
    chats,
  ]);

  const getOfflineMembers = () => {
    if (type === "individual") {
      return [
        {
          uuid: remoteUserId,
          username: remoteUsername,
          image: remoteUserImage,
        },
      ];
    }
    const userMap = {};
    chats.map((x) => {
      if (x.uuid !== uuid) {
        userMap[x.uuid] = x;
      }
    });
    return Object.keys(userMap).map((uuid) => userMap[uuid]);
  };

  return (
    <MessageInputProvider
      inputRef={inputRef}
      offlineMembers={getOfflineMembers().slice(0, 5)}
    >
      <div className={classes.outerDiv}>
        {selectedFile ? (
          <div>
            <div style={{ background: theme.custom.colors.bg3 }}>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row-reverse",
                }}
              >
                <HighlightOffIcon
                  style={{
                    color: theme.custom.colors.icon,
                    cursor: "pointer",
                    marginRight: 5,
                    marginTop: 5,
                  }}
                  onClick={() => {
                    setSelectedFile(null);
                    setUploadingFile(false);
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {selectedMediaKind === "image" ? (
                  <img
                    style={{ maxHeight: 300, maxWidth: 300 }}
                    src={selectedFile}
                  />
                ) : (
                  <video
                    style={{ maxHeight: 300, maxWidth: 300 }}
                    controls
                    src={selectedFile}
                  />
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 3,
                }}
              >
                {uploadingFile ? (
                  <>
                    {" "}
                    <div
                      style={{
                        marginRight: 5,
                        color: theme.custom.colors.fontColor,
                      }}
                    >
                      Uploading{" "}
                    </div>
                    <div>
                      <CircularProgress size={20} color="secondary" />{" "}
                    </div>{" "}
                  </>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
        {activeReply.parent_client_generated_uuid ? (
          <ReplyContainer
            marginBottom={6}
            padding={12}
            parent_username={activeReply.parent_username || ""}
            showCloseBtn
            text={activeReply.text}
          />
        ) : null}
        {aboveMessagePlugin ? (
          <AboveMessagePluginRenderer
            setPluginMenuOpen={setPluginMenuOpen}
            sendMessage={sendMessage}
            setAboveMessagePlugin={setAboveMessagePlugin}
          />
        ) : null}
        <CustomAutoComplete />
        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              marginLeft: 5,
            }}
          >
            <IconButton
              disableRipple
              size="small"
              sx={{
                color: "#555C6B",
                "&:hover": {
                  backgroundColor: `${theme.custom.colors.hoverIconBackground} !important`,
                },
              }}
              onClick={() => {
                if (pluginMenuOpen) {
                  setAboveMessagePlugin({
                    type: "",
                    metadata: {},
                  });
                }
                setPluginMenuOpen(!pluginMenuOpen);
              }}
            >
              {pluginMenuOpen ? (
                <CloseIcon style={{ fontSize: 24 }} />
              ) : (
                <AddIcon style={{ fontSize: 24 }} />
              )}
            </IconButton>
          </div>
          <MessageInput onMediaSelect={onMediaSelect} setPluginMenuOpen={setPluginMenuOpen} />
        </div>
        {pluginMenuOpen ? (
          <div style={{ display: "flex", marginLeft: 8, paddingBottom: 5 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            />
            <EmojiPickerComponent
              setEmojiPicker={setEmojiPicker}
              emojiPicker={emojiPicker}
              setGifPicker={setGifPicker}
              inputRef={inputRef}
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
            <Attachment
              onMediaSelect={onMediaSelect}
              buttonStyle={{
                height: "28px",
              }}
            />
            {featureGates["STICKER_ENABLED"] ? (
              <NftSticker
                buttonStyle={{
                  height: "28px",
                }}
                setPluginMenuOpen={setPluginMenuOpen}
                setAboveMessagePlugin={setAboveMessagePlugin}
              />
            ) : null}
            {type === "individual" && featureGates["BARTER_ENABLED"] ? (
              <Barter
                setOpenPlugin={setOpenPlugin}
                onMediaSelect={onMediaSelect}
                buttonStyle={{
                  height: "28px",
                }}
              />
            ) : null}
            {SECURE_TRANSFER_ENABLED &&
            activeSolanaWallet?.publicKey &&
            type === "individual" ? (
              <SecureTransfer
                buttonStyle={{
                  height: "28px",
                }}
                setAboveMessagePlugin={setAboveMessagePlugin}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </MessageInputProvider>
  );
};
