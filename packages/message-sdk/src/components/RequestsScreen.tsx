import { useRequests } from "@coral-xyz/db";
import { useUser } from "@coral-xyz/recoil";

import { EmptyRequests } from "./EmptyRequests";
import { MessageList } from "./MessageList";
import { useStyles } from "./styles";

export const RequestsScreen = () => {
  const { uuid } = useUser();
  const activeChats = useRequests(uuid) || [];
  const classes = useStyles();

  return (
    <div
      className={classes.container}
      style={{ display: "flex", flexDirection: "column" }}
    >
      <div
        className={classes.smallTitle2}
        style={{
          display: "flex",
          justifyContent: "center",
          textAlign: "center",
          margin: 15,
        }}
      >
        These are not from your friends. Click into a message to reply or view
        their profile.
      </div>
      {activeChats.length !== 0 ? <MessageList
        toRoot={false}
        activeChats={activeChats.map((x) => ({
            chatType: "individual",
            chatProps: x,
          }))}
        /> : null}
      {activeChats.length === 0 ? <EmptyRequests /> : null}
    </div>
  );
};
