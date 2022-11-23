import { MessageLeft } from "./Message";
import { SendMessage } from "./SendMessage";
import { ScrollBarImpl } from "./ScrollbarImpl";
import { useEffect, useRef } from "react";
import { useChatContext } from "./ChatContext";
export const FullScreenChat = ({ messageContainerRef, chats }) => {
  const { chatManager } = useChatContext();
  const messageRef = useRef<any>();
  function scrollHandler() {
    if (messageRef && messageRef.current) {
      const elem = messageRef.current;
      if (elem.scrollHeight - elem.scrollTop === elem.clientHeight) {
        console.log("bottom");
      }
      if (elem.scrollTop === 0) {
        chatManager?.fetchMoreChats();
      }
    }
  }

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
          {chats.map((chat) => {
            return (
              <MessageLeft
                timestamp={chat.created_at}
                key={chat.id}
                message={chat.message}
                received={chat.received}
              />
            );
          })}
        </div>
      </ScrollBarImpl>
      <div style={{ position: "absolute", bottom: 0, width: "100%" }}>
        <SendMessage messageRef={messageRef} />
      </div>
    </div>
  );
};
