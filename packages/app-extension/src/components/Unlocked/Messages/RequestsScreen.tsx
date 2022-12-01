import { BACKEND_API_URL, EnrichedInboxDb } from "@coral-xyz/common";
import { useEffect, useState } from "react";
import { MessagesSkeleton } from "./MessagesSkeleton";
import { MessageList } from "./MessageList";
import { useStyles } from "./styles";

export const RequestsScreen = () => {
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [activeChats, setActiveChats] = useState<EnrichedInboxDb[]>([]);
  const classes = useStyles();

  const init = async () => {
    const res = await fetch(`${BACKEND_API_URL}/inbox?areFriends=false`);
    const json = await res.json();
    setMessagesLoading(false);
    setActiveChats(json.chats || []);
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div className={classes.container}>
      <br />
      <div
        className={classes.smallTitle}
        style={{
          display: "flex",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        These are not from your contacts. Click into a message to reply or view
        their profile.
      </div>
      <br />
      {messagesLoading && <MessagesSkeleton />}
      {!messagesLoading && <MessageList activeChats={activeChats} />}
    </div>
  );
};
