import { useEffect, useState } from "react";
import { SearchBox } from "@coral-xyz/app-extension/src/components/Unlocked/Messages/SearchBox";
import type { RemoteUserData } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { refreshFriendships, useActiveChats } from "@coral-xyz/db";
import { EmptyState, TextInput } from "@coral-xyz/react-common";
import { useFriendships, useRequestsCount, useUser } from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import { useRecoilState } from "recoil";

import { ParentCommunicationManager } from "../ParentCommunicationManager";

import { MessageList } from "./MessageList";
import { MessagesSkeleton } from "./MessagesSkeleton";
import { useStyles } from "./styles";
import { UserList } from "./UserList";

export function Inbox() {
  const classes = useStyles();
  const { uuid } = useUser();
  const activeChats = useFriendships({ uuid });
  const requestCount = useRequestsCount({ uuid });
  const [searchResults, setSearchResults] = useState<RemoteUserData[]>([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [refreshing, setRefreshing] = useState(true);

  const searchedUsersDistinct = searchResults.filter(
    (result) =>
      !activeChats?.map((x) => x.remoteUsername).includes(result.username)
  );

  useEffect(() => {
    refreshFriendships(uuid)
      .then(() => setRefreshing(false))
      .catch(() => setRefreshing(false));
  }, [uuid]);

  return (
    <div
      className={classes.container}
      style={{ marginTop: "8px", display: "flex", flexDirection: "column" }}
    >
      <SearchBox
        onChange={async (prefix) => {
          setSearchFilter(prefix);
          if (prefix.length >= 3) {
            //TODO debounce
            const res = await ParentCommunicationManager.getInstance().fetch(
              `${BACKEND_API_URL}/users?usernamePrefix=${prefix}`
            );
            try {
              const json = await res.json();
              setSearchResults(
                json.users.sort((a, b) =>
                  a.username.length < b.username.length ? -1 : 1
                ) || []
              );
            } catch (e) {
              console.error(e);
            }
          } else {
            setSearchResults([]);
          }
        }}
      />
      {(!activeChats || (refreshing && !activeChats.length)) && (
        <MessagesSkeleton />
      )}
      {activeChats &&
        (activeChats.length || !refreshing) &&
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
      {activeChats &&
        (activeChats.length || !refreshing) &&
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
