import { MessageLeft } from "./Message";
import { SendMessage } from "./SendMessage";
import InfoIcon from "@mui/icons-material/Info";
import { ScrollBarImpl } from "./ScrollbarImpl";
import { useEffect, useRef, useState } from "react";
import { useChatContext } from "./ChatContext";
import { MessagesSkeleton } from "./MessagesSkeleton";
import { EmptyChat } from "./EmptyChat";
import { useStyles } from "./styles";
import { useCustomTheme } from "@coral-xyz/themes";
export const FullScreenChat = ({ messageContainerRef, chats }) => {
  const { chatManager, loading, areFriends, requested } = useChatContext();
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
          {!areFriends && !requested && (
            <Banner title={"This account is not a friend."} />
          )}
          {!areFriends && requested && (
            <Banner title={"Contact pending request"} />
          )}
          {loading && <MessagesSkeleton />}
          {!loading && chats.length === 0 && <EmptyChat />}
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
                  image={chat.image}
                  username={chat.username}
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

function Banner({ title }: { title: String }) {
  const theme = useCustomTheme();
  const classes = useStyles();
  return (
    <div>
      <div
        className={`${classes.noContactBanner} ${classes.horizontalCenter} ${classes.text}`}
      >
        {" "}
        <InfoIcon
          style={{ color: theme.custom.colors.fontColor, marginRight: 5 }}
        />{" "}
        {title}
      </div>
      <br />
    </div>
  );
}
