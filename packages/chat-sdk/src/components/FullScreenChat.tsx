import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import type { EnrichedMessageWithMetadata } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { fetchMoreChatsFor } from "@coral-xyz/chat-xplat";
import { useCustomTheme } from "@coral-xyz/themes";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import FileUploadIcon from "@mui/icons-material/FileUploadRounded";
import { CircularProgress, Typography } from "@mui/material";

import { MessagePluginRenderer } from "../MessagePluginRenderer";
import { base64ToArrayBuffer } from "../utils/imageUploadUtils";

import { Banner } from "./Banner";
import { useChatContext } from "./ChatContext";
import { EmptyChat } from "./EmptyChat";
import { ChatMessages } from "./Message";
import { MessagesSkeleton } from "./MessagesSkeleton";
import { ScrollBarImpl } from "./ScrollbarImpl";
import { SendMessage } from "./SendMessage";

export const FullScreenChat = ({
  setLocalUnreadCount,
  messageRef,
  setMessageRef,
  jumpToBottom,
  setShowJumpToBottom,
  localUnreadCount,
}) => {
  const {
    loading,
    chats,
    userId,
    roomId,
    type,
    nftMint,
    publicKey,
    selectedFile,
    setSelectedFile,
    uploadingFile,
    setUploadingFile,
    selectedMediaKind,
    setSelectedMediaKind,
    uploadedImageUri,
    setUploadedImageUri,
  } = useChatContext();
  const [autoScroll, setAutoScroll] = useState(true);
  const theme = useCustomTheme();
  const existingMessagesRef = useRef<EnrichedMessageWithMetadata[]>([]);
  const [fetchingMoreChats, setFetchingMoreChats] = useState(false);
  const [pluginMenuOpen, setPluginMenuOpen] = useState(false);

  const { getRootProps, getInputProps, isDragAccept } = useDropzone({
    onDrop: (files) => {
      const selectedFile = files[0];
      onMediaSelect(selectedFile);
    },
  });

  useEffect(() => {
    if (messageRef && autoScroll) {
      if (
        JSON.stringify(existingMessagesRef.current || []) !==
        JSON.stringify(chats)
      ) {
        //@ts-ignore
        messageRef?.scrollToBottom?.();
        setTimeout(() => {
          if (messageRef) {
            //@ts-ignore
            messageRef?.scrollToBottom?.();
          }
        }, 500);
      }
      existingMessagesRef.current = chats;
    }
  }, [chats, autoScroll]);

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

  const onMediaSelect = (file: File) => {
    const fileType = file.type.split("/")[0];

    if (fileType === "image" || fileType === "video") {
      let reader = new FileReader();
      reader.onload = (e) => {
        setSelectedMediaKind(file.name.endsWith("mp4") ? "video" : "image");
        setSelectedFile(e.target?.result);
        uploadToS3(e.target?.result as string, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      {...getRootProps({
        onClick: (event) => event.stopPropagation(),
        style: {
          display: "flex",
          flexFlow: "column",
          height: "100%",
          position: "relative",
          background: theme.custom.colors.chatFadeGradient,
        },
      })}
    >
      {isDragAccept ? <DropzonePopup /> : null}
      <div
        id="messageContainer"
        style={{
          height: "calc(100% - 50px)",
        }}
      >
        <ScrollBarImpl
          onScrollStop={async () => {
            // @ts-ignore
            const scrollContainer = messageRef?.container?.children?.[0];
            if (scrollContainer) {
              if (
                scrollContainer.scrollHeight -
                  scrollContainer.scrollTop -
                  scrollContainer.clientHeight <=
                1
              ) {
                setAutoScroll(true);
                setShowJumpToBottom(false);
                window.setTimeout(() => {
                  setLocalUnreadCount(0);
                }, 150);
              } else {
                // User has scrolled up, don't autoscroll as more messages come in.
                if (autoScroll) {
                  setAutoScroll(false);
                }
                if (
                  scrollContainer.scrollHeight -
                    scrollContainer.scrollTop -
                    scrollContainer.clientHeight >
                  500
                ) {
                  // user has scrolled way up, give them a way to come down
                  setShowJumpToBottom(true);
                }
              }
              if (scrollContainer.scrollTop === 0) {
                setFetchingMoreChats(true);
                try {
                  await fetchMoreChatsFor(
                    userId,
                    roomId,
                    type,
                    nftMint,
                    publicKey
                  );
                } catch (e) {
                  console.error(e);
                }
                setFetchingMoreChats(false);
              }
            }
          }}
          setRef={setMessageRef}
          height="calc(100% - 50px)"
        >
          <div>
            <div
              style={{
                paddingBottom: 20,
                transform: pluginMenuOpen ? "translate(0, -35px)" : undefined,
              }}
            >
              <input {...getInputProps()} />
              <div>
                {fetchingMoreChats ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: 3,
                      marginTop: 3,
                    }}
                  >
                    {" "}
                    <CircularProgress size={20} />{" "}
                  </div>
                ) : null}
                <Banner />
                {loading ? <MessagesSkeleton /> : null}
                {!loading && chats?.length === 0 ? <EmptyChat /> : null}
                {!loading && chats?.length !== 0 ? <ChatMessages /> : null}
              </div>
            </div>
          </div>
        </ScrollBarImpl>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 70,
          right: 0,
          transition: "visibility 0.1s",
          visibility: jumpToBottom ? "visible" : "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row-reverse",
            marginRight: 10,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              display: "inline-flex",
              cursor: "pointer",
              padding: "8px 12px 8px 16px",
              background: theme.custom.colors.invertedPrimary,
              color: theme.custom.colors.background,
              borderRadius: 16,
            }}
            onClick={() => messageRef?.scrollToBottom?.()}
          >
            {localUnreadCount
              ? localUnreadCount === 1
                ? "1 unread message"
                : `${localUnreadCount} unread messages`
              : "Jump to bottom"}{" "}
            <ArrowDownwardIcon
              style={{
                color: theme.custom.colors.icon,
                fontSize: 14,
                marginTop: 2,
                marginLeft: 2,
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 0, width: "100%" }}>
        <SendMessage
          uploadingFile={uploadingFile}
          setUploadingFile={setUploadingFile}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          onMediaSelect={onMediaSelect}
          uploadedImageUri={uploadedImageUri}
          selectedMediaKind={selectedMediaKind}
          pluginMenuOpen={pluginMenuOpen}
          setPluginMenuOpen={setPluginMenuOpen}
        />
      </div>
    </div>
  );
};

function DropzonePopup() {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        position: "absolute",
        height: "100%",
        width: "100%",
        background: `${theme.custom.colors.nav}85`,
        backdropFilter: "blur(20px)",
        zIndex: 50,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "80%",
          textAlign: "center",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FileUploadIcon
          sx={{
            color: theme.custom.colors.icon,
            fontSize: "38px",
            mb: "8px",
          }}
        />
        <Typography
          fontSize="24px"
          sx={{ color: theme.custom.colors.fontColor, mb: "8px" }}
        >
          Upload
        </Typography>
        <Typography sx={{ color: theme.custom.colors.fontColor3 }}>
          Drop photos, GIFs, and videos anywhere to upload.
        </Typography>
      </div>
    </div>
  );
}
