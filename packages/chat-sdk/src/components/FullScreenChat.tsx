import { useEffect, useRef, useState } from "react";
import { useCustomTheme } from "@coral-xyz/themes";
import InfoIcon from "@mui/icons-material/Info";

import { Banner } from "./Banner";
import { useChatContext } from "./ChatContext";
import { EmptyChat } from "./EmptyChat";
import { ChatMessages } from "./Message";
import { MessagesSkeleton } from "./MessagesSkeleton";
import { ScrollBarImpl } from "./ScrollbarImpl";
import { SendMessage } from "./SendMessage";
import { useStyles } from "./styles";
export const FullScreenChat = () => {
  const { chatManager, loading, areFriends, requested, chats } =
    useChatContext();
  const [autoScroll, setAutoScroll] = useState(true);
  const theme = useCustomTheme();

  const messageRef = useRef<any>();

  function scrollHandler() {
    if (messageRef && messageRef.current) {
      const elem = messageRef.current;
      if (elem.scrollHeight - elem.scrollTop === elem.clientHeight) {
        setAutoScroll(true);
      } else {
        // User has scrolled up, don't autoscroll as more messages come in.
        if (autoScroll) {
          setAutoScroll(false);
        }
      }
      if (elem.scrollTop === 0) {
        chatManager?.fetchMoreChats();
      }
    }
  }

  useEffect(() => {
    if (messageRef.current && autoScroll) {
      messageRef.current.scrollTop = messageRef.current.scrollHeight;
      setTimeout(() => {
        messageRef.current.scrollTop = messageRef.current.scrollHeight;
      }, 500);
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
      <ScrollBarImpl>
        <div
          onScroll={scrollHandler}
          id={"messageContainer"}
          ref={messageRef}
          style={{
            overflowY: "scroll",
            height: "calc(100% - 67px)",
            background: theme.custom.colors.bg3,
          }}
        >
          <Banner />
          <br />
          {loading && <MessagesSkeleton />}
          {!loading && chats?.length === 0 && <EmptyChat />}
          {!loading && chats?.length !== 0 && <ChatMessages />}
        </div>
      </ScrollBarImpl>
      <div style={{ position: "absolute", bottom: 0, width: "100%" }}>
        <SendMessage messageRef={messageRef} />
      </div>
    </div>
  );
};
