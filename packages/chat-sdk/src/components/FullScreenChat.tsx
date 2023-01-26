import { useEffect, useRef, useState } from "react";
import Dropzone from "react-dropzone";
import type { EnrichedMessageWithMetadata } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { fetchMoreChatsFor, Loading } from "@coral-xyz/react-common";
import { useCustomTheme } from "@coral-xyz/themes";
import { Loader } from "@giphy/react-components";
import { CircularProgress } from "@mui/material";

import { base64ToArrayBuffer } from "../utils/imageUploadUtils";

import { Banner } from "./Banner";
import { useChatContext } from "./ChatContext";
import { EmptyChat } from "./EmptyChat";
import { ChatMessages } from "./Message";
import { MessagesSkeleton } from "./MessagesSkeleton";
import { ScrollBarImpl } from "./ScrollbarImpl";
import { SendMessage } from "./SendMessage";

export const FullScreenChat = ({ messageRef, setMessageRef }) => {
  const { loading, chats, userId, roomId, type, nftMint, publicKey } =
    useChatContext();
  const [autoScroll, setAutoScroll] = useState(true);
  const theme = useCustomTheme();
  const existingMessagesRef = useRef<EnrichedMessageWithMetadata[]>([]);
  const [fetchingMoreChats, setFetchingMoreChats] = useState(false);
  const [selectedMediaKind, setSelectedMediaKind] = useState<"image" | "video">(
    "image"
  );
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedImageUri, setUploadedImageUri] = useState("");

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
    let reader = new FileReader();
    reader.onload = (e) => {
      setSelectedMediaKind(file.name.endsWith("mp4") ? "video" : "image");
      setSelectedFile(e.target?.result);
      uploadToS3(e.target?.result as string, file.name);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      style={{
        display: "flex",
        flexFlow: "column",
        height: "100%",
        background: theme.custom.colors.bg3,
      }}
    >
      <div
        id={"messageContainer"}
        style={{
          height: "calc(100% - 40px)",
          background: theme.custom.colors.bg3,
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
              } else {
                // User has scrolled up, don't autoscroll as more messages come in.
                if (autoScroll) {
                  setAutoScroll(false);
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
          height={"calc(100% - 40px)"}
        >
          <div>
            <Dropzone
              onDrop={(files) => {
                const selectedFile = files[0];
                onMediaSelect(selectedFile);
              }}
            >
              {({ getRootProps, getInputProps, isFocused }) => (
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <div>
                    {fetchingMoreChats && (
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
                    )}
                    <Banner />
                    {loading && <MessagesSkeleton />}
                    {!loading && chats?.length === 0 && <EmptyChat />}
                    {!loading && chats?.length !== 0 && <ChatMessages />}
                  </div>
                </div>
              )}
            </Dropzone>
          </div>
        </ScrollBarImpl>
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
        />
      </div>
    </div>
  );
};
