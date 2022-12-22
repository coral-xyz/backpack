import { useEffect, useState } from "react";
import type { EnrichedInboxDb } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { useActiveChats } from "@coral-xyz/db";
import { EmptyState, TextInput } from "@coral-xyz/react-common";
import { useUser } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";

import { ParentCommunicationManager } from "../ParentCommunicationManager";

import { MessageList } from "./MessageList";
import { MessagesSkeleton } from "./MessagesSkeleton";
import { useStyles } from "./styles";
import { UserList } from "./UserList";

export function Inbox() {
  const classes = useStyles();
  const { uuid } = useUser();
  const [searchFilter, setSearchFilter] = useState("");
  const [messagesLoading, setMessagesLoading] = useState(true);
  const activeChats = useActiveChats(uuid) || [];
  const setActiveChats = () => {};
  // const [activeChats, setActiveChats] = useState<EnrichedInboxDb[]>([]);
  const [requestCount, setRequestCount] = useState(0);
  const [searchResults, setSearchResults] = useState<
    { image: string; id: string; username: string }[]
  >([]);
  const theme = useCustomTheme();

  const init = async () => {
    const res = await ParentCommunicationManager.getInstance().fetch(
      `${BACKEND_API_URL}/inbox?areConnected=true`
    );
    const json = await res.json();
    setMessagesLoading(false);
    setActiveChats(json.chats || []);
    setRequestCount(json.requestCount || 0);
  };

  useEffect(() => {
    init();
  }, [uuid]);

  const searchedUsersDistinct = searchResults.filter(
    (result) =>
      !activeChats.map((x) => x.remoteUsername).includes(result.username)
  );

  return (
    <div
      className={classes.container}
      style={{ display: "flex", flexDirection: "column" }}
    >
      <div style={{ height: 8 }}></div>
      <TextInput
        className={classes.searchField}
        placeholder={"Search for people"}
        value={searchFilter}
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon style={{ color: theme.custom.colors.icon }} />
          </InputAdornment>
        }
        setValue={async (e) => {
          const prefix = e.target.value;
          setSearchFilter(prefix);
          if (prefix.length >= 3) {
            //TODO debounce
            const res = await ParentCommunicationManager.getInstance().fetch(
              `${BACKEND_API_URL}/users?usernamePrefix=${prefix}`
            );
            const json = await res.json();
            setSearchResults(
              json.users.sort((a, b) =>
                a.username.length < b.username.length ? -1 : 1
              ) || []
            );
          } else {
            setSearchResults([]);
          }
        }}
        inputProps={{
          style: {
            height: "48px",
          },
        }}
      />
      {messagesLoading && <MessagesSkeleton />}
      {!messagesLoading &&
        (activeChats.filter((x) => x.remoteUsername.includes(searchFilter))
          .length > 0 ||
          requestCount > 0) && (
          <>
            {searchFilter.length >= 3 && (
              <div className={classes.topLabel}>Your contacts</div>
            )}
            <MessageList
              requestCount={searchFilter.length < 3 ? requestCount : 0}
              activeChats={activeChats.filter((x) =>
                x.remoteUsername.includes(searchFilter)
              )}
            />
          </>
        )}
      {searchFilter.length >= 3 && searchedUsersDistinct.length !== 0 && (
        <div style={{ marginTop: 30 }}>
          <div className={classes.topLabel}>Other people</div>
          <UserList users={searchedUsersDistinct} />
        </div>
      )}
      {!messagesLoading &&
        searchFilter.length < 3 &&
        requestCount === 0 &&
        activeChats.length === 0 && (
          <div
            style={{
              flexGrow: 1,
              justifyContent: "center",
              flexDirection: "column",
              display: "flex",
              paddingBottom: 50,
            }}
          >
            {" "}
            <EmptyState
              icon={(props: any) => <ChatBubbleIcon {...props} />}
              title={"No messages"}
              subtitle={"Search for someone to send a message to!"}
            />
          </div>
        )}
    </div>
  );
}
