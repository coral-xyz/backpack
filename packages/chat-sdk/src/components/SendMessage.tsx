import { useEffect, useRef, useState } from "react";
import type { MessageKind, MessageMetadata } from "@coral-xyz/common";
import { BACKEND_API_URL, CHAT_MESSAGES } from "@coral-xyz/common";
import { createEmptyFriendship, useDbUser } from "@coral-xyz/db";
import { SignalingManager, useUsersMetadata } from "@coral-xyz/react-common";
import { useActiveSolanaWallet, useUser } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import ArrowForwardIos from "@mui/icons-material/ArrowForwardIos";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { CircularProgress, IconButton } from "@mui/material";
import { createStyles, makeStyles } from "@mui/styles";
import { v4 as uuidv4 } from "uuid";

import { base64ToArrayBuffer } from "../utils/imageUploadUtils";

import { CustomAutoComplete, MessageInput } from "./messageInput/MessageInput";
import { MessageInputProvider } from "./messageInput/MessageInputProvider";
import { Attatchment } from "./Attatchment";
import { useChatContext } from "./ChatContext";
import { EmojiPickerComponent } from "./EmojiPicker";
import { GifPicker } from "./GifPicker";
import { ReplyContainer } from "./ReplyContainer";
import { SecureTransfer } from "./SecureTransfer";

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
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedImageUri, setUploadedImageUri] = useState("");
  const [emojiPicker, setEmojiPicker] = useState(false);
  const [gifPicker, setGifPicker] = useState(false);
  const [emojiMenuOpen, setEmojiMenuOpen] = useState(false);
  const [selectedMediaKind, setSelectedMediaKind] = useState<"image" | "video">(
    "image"
  );
  const theme = useCustomTheme();
  const activeSolanaWallet = useActiveSolanaWallet();
  const inputRef = useRef<any>(null);

  const {
    remoteUserId,
    remoteUsername,
    roomId,
    activeReply,
    setActiveReply,
    type,
    chats,
  } = useChatContext();
  const remoteUsers = useUsersMetadata({ remoteUserIds: [remoteUserId] });
  const remoteUserImage = remoteUsers?.[0]?.image;

  const sendMessage = async (
    messageTxt,
    messageKind: MessageKind = "text",
    messageMetadata?: MessageMetadata
  ) => {
    if (selectedFile && uploadingFile) {
      return;
    }
    if (messageTxt || selectedFile) {
      if (selectedFile) {
        messageKind = "media";
        messageMetadata = {
          media_kind: selectedMediaKind,
          media_link: uploadedImageUri,
        };
        setSelectedFile(null);
      }
      const client_generated_uuid = uuidv4();
      if (chats.length === 0 && type === "individual") {
        // If it's the first time the user is interacting,
        // create an in memory friendship
        createEmptyFriendship(uuid, remoteUserId, {
          last_message_sender: uuid,
          last_message_timestamp: new Date().toISOString(),
          last_message:
            messageKind === "gif"
              ? "GIF"
              : messageKind === "secure-transfer"
              ? "Secure Transfer"
              : messageKind === "media"
              ? "Media"
              : messageTxt,
          last_message_client_uuid: client_generated_uuid,
        });
      }
      SignalingManager.getInstance()?.send({
        type: CHAT_MESSAGES,
        payload: {
          messages: [
            {
              client_generated_uuid: client_generated_uuid,
              message: messageTxt,
              message_kind: messageKind,
              message_metadata: messageMetadata,
              parent_client_generated_uuid:
                activeReply.parent_client_generated_uuid
                  ? activeReply.parent_client_generated_uuid
                  : undefined,
              //@ts-ignore
              parent_message_author_username:
                activeReply.parent_client_generated_uuid
                  ? activeReply.parent_username?.slice(1)
                  : undefined,
              //@ts-ignore
              parent_message_text: activeReply.parent_client_generated_uuid
                ? activeReply.text
                : undefined,
              parent_message_author_uuid:
                activeReply.parent_message_author_uuid,
            },
          ],
          type: type,
          room: roomId,
        },
      });

      setActiveReply({
        parent_username: "",
        parent_client_generated_uuid: null,
        text: "",
      });
      inputRef.current.setValue("");
    }
  };

  const uploadToS3 = async (selectedFile: string, selectedFileName: string) => {
    try {
      setUploadingFile(true);
      const response = await fetch(`${BACKEND_API_URL}/s3/signedUrl`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: selectedFileName,
        }),
      });

      const json = await response.json();
      await fetch(json.uploadUrl, {
        method: "PUT",
        body: base64ToArrayBuffer(selectedFile),
      });
      setUploadingFile(false);
      setUploadedImageUri(json.url);
    } catch (e) {
      setUploadingFile(false);
    }
  };

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
    <MessageInputProvider inputRef={inputRef}>
      <div className={classes.outerDiv}>
        {selectedFile && (
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
                    controls={true}
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
                {uploadingFile && (
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
                )}
              </div>
            </div>
          </div>
        )}
        {activeReply.parent_client_generated_uuid && (
          <ReplyContainer
            marginBottom={6}
            parent_username={activeReply.parent_username || ""}
            showCloseBtn={true}
            text={activeReply.text}
          />
        )}
        <CustomAutoComplete offlineMembers={getOfflineMembers().slice(0, 5)} />
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
                <Attatchment
                  onImageSelect={(file: File) => {
                    let reader = new FileReader();
                    reader.onload = (e) => {
                      setSelectedMediaKind(
                        file.name.endsWith("mp4") ? "video" : "image"
                      );
                      setSelectedFile(e.target?.result);
                      uploadToS3(e.target?.result as string, file.name);
                    };
                    reader.readAsDataURL(file);
                  }}
                  buttonStyle={{
                    height: "28px",
                  }}
                />
                {/*{activeSolanaWallet?.publicKey && (*/}
                {/*  <SecureTransfer*/}
                {/*    buttonStyle={{*/}
                {/*      height: "28px",*/}
                {/*    }}*/}
                {/*    remoteUserId={remoteUserId}*/}
                {/*    onTxFinalized={({ signature, counter, escrow }) => {*/}
                {/*      sendMessage("Secure transfer", "secure-transfer", {*/}
                {/*        signature,*/}
                {/*        counter,*/}
                {/*        escrow,*/}
                {/*        current_state: "pending",*/}
                {/*      });*/}
                {/*    }}*/}
                {/*  />*/}
                {/*)}*/}
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
                  onClick={() => {
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
          <MessageInput setEmojiMenuOpen={setEmojiMenuOpen} />
        </div>
      </div>
    </MessageInputProvider>
  );
};
