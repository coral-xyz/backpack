import { useEffect, useRef, useState } from "react";
import type { EnrichedMessageWithMetadata } from "@coral-xyz/common";
import { fetchMoreChatsFor } from "@coral-xyz/db";
import { useCustomTheme } from "@coral-xyz/themes";

import { Banner } from "./Banner";
import { useChatContext } from "./ChatContext";
import { EmptyChat } from "./EmptyChat";
import { ChatMessages } from "./Message";
import { MessagesSkeleton } from "./MessagesSkeleton";
import { ScrollBarImpl } from "./ScrollbarImpl";
import { SendMessage } from "./SendMessage";

export const FullScreenChat = () => {
  const { loading, chats, userId, roomId, type, nftMint, publicKey } =
    useChatContext();
  const [autoScroll, setAutoScroll] = useState(true);
  const theme = useCustomTheme();
  const existingMessagesRef = useRef<EnrichedMessageWithMetadata[]>([]);

  const [messageRef, setMessageRef] = useState(null);

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
          onScrollStop={() => {
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
                fetchMoreChatsFor(userId, roomId, type, nftMint, publicKey);
              }
            }
          }}
          setRef={setMessageRef}
          height={"calc(100% - 40px)"}
        >
          <div id={"scrolling1"}>
            <Banner />
            {loading && <MessagesSkeleton />}
            {!loading && chats?.length === 0 && <EmptyChat />}
            {!loading && chats?.length !== 0 && <ChatMessages />}
          </div>
        </ScrollBarImpl>
      </div>
      <div style={{ position: "absolute", bottom: 0, width: "100%" }}>
        <SendMessage />
      </div>
    </div>
  );
};
