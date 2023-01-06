import { useEffect, useState } from "react";
import { SearchBox } from "@coral-xyz/app-extension/src/components/Unlocked/Messages/SearchBox";
import type { RemoteUserData } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { useActiveChats, useRequestsCount } from "@coral-xyz/db";
import { EmptyState, TextInput } from "@coral-xyz/react-common";
import { useUser } from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
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
  const [messagesLoading, setMessagesLoading] = useState(false);
  const activeChats = useActiveChats(uuid) || [];
  // const [activeChats, setActiveChats] = useState<EnrichedInboxDb[]>([]);
  const requestCount = useRequestsCount(uuid) || 0;
  const [searchResults, setSearchResults] = useState<RemoteUserData[]>([]);
  const theme = useCustomTheme();
  const [searchFilter, setSearchFilter] = useState("");

  const searchedUsersDistinct = searchResults.filter(
    (result) =>
      !activeChats.map((x) => x.remoteUsername).includes(result.username)
  );

  let debouncedTimer;
  const debouncedInit = () => {
    clearTimeout(debouncedTimer);
    debouncedTimer = setTimeout(() => {
      handleContactSearch();
    }, 250);
  };

  const handleContactSearch = async () => {
    if (searchFilter.length >= 3) {
      const response = await ParentCommunicationManager.getInstance().fetch(
        `${BACKEND_API_URL}/users?usernamePrefix=${searchFilter}`
      );
      const json = await response.json();
      setSearchResults(
        json.users.sort((a, b) =>
          a.username.length < b.username.length ? -1 : 1
        ) || []
      );
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div
      className={classes.container}
      style={{ marginTop: "8px", display: "flex", flexDirection: "column" }}
    >
      <SearchBox
        onChange={async (prefix: string) => {
          setSearchFilter(prefix);
          debouncedInit();
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
          <UserList
            users={searchedUsersDistinct}
            setMembers={setSearchResults}
          />
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
              subtitle={"Search for someone to send a message!"}
            />
          </div>
        )}
    </div>
  );
}
