import { MessageLeft, MessageRight } from "./Message";
import { SendMessage } from "./SendMessage";

export const FullScreenChat = ({ messageContainerRef, chats }) => {
  return (
    <div
      style={{
        display: "flex",
        flexFlow: "column",
        height: "100%",
      }}
    >
      <div style={{ flex: "1 1 auto", height: "90%", overflow: "scroll" }}>
        {chats.map((chat) => {
          if (chat.direction === "recv") {
            return <MessageLeft key={chat.id} message={chat.message} />;
          } else {
            return (
              <MessageRight
                key={chat.id}
                message={chat.message}
                received={chat.received}
              />
            );
          }
        })}
      </div>
      <div style={{ flex: "0 1 auto" }}>
        <SendMessage />
      </div>
    </div>
  );
};
