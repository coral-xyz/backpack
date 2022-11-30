import { MessageLeft } from "./Message";
import { SendMessage } from "./SendMessage";
import { ScrollBarImpl } from "./ScrollbarImpl";
import { useEffect, useRef, useState } from "react";
import { useChatContext } from "./ChatContext";
import { MessagesSkeleton } from "./MessagesSkeleton";
import { EmptyChat } from "./EmptyChat";
export const FullScreenChat = ({ messageContainerRef, chats }) => {
  const { chatManager, loading } = useChatContext();
  const [autoScroll, setAutoScroll] = useState(true);

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
    }
  }, [chats, autoScroll]);

  return (
    <div
      style={{
        display: "flex",
        flexFlow: "column",
        height: "100%",
      }}
    >
      <ScrollBarImpl>
        <div
          onScroll={scrollHandler}
          id={"messageContainer"}
          ref={messageRef}
          style={{
            overflowY: "scroll",
            height: "calc(100% - 47px)",
            padding: 15,
          }}
        >
          {loading && <MessagesSkeleton />}
          {!loading &&
            chats.length !== 0 &&
            chats.map((chat) => {
              return (
                <MessageLeft
                  timestamp={chat.created_at}
                  key={chat.id}
                  message={chat.message}
                  received={chat.received}
                  messageKind={chat.message_kind}
                />
              );
            })}
          {!loading && chats.length === 0 && <EmptyChat />}
        </div>
      </ScrollBarImpl>
      <div style={{ position: "absolute", bottom: 0, width: "100%" }}>
        <SendMessage messageRef={messageRef} />
      </div>
    </div>
  );
};
