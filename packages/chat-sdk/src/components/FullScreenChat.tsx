import { MessageLeft } from "./Message";
import { SendMessage } from "./SendMessage";
import { ScrollBarImpl } from "./ScrollbarImpl";
import { useRef } from "react";
export const FullScreenChat = ({ messageContainerRef, chats }) => {
  const messageRef = useRef<any>();
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
          id={"messageContainer"}
          ref={messageRef}
          style={{ overflowY: "scroll", height: "100%", padding: 15 }}
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
