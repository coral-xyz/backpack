import { useState } from "react";
import type { EnrichedInboxDb, RemoteUserData } from "@coral-xyz/common";
import { UserList } from "@coral-xyz/message-sdk";
import { ContactsIcon, EmptyState, TextInput } from "@coral-xyz/react-common";
import { useCustomTheme } from "@coral-xyz/themes";
import SearchIcon from "@mui/icons-material/Search";
import { Typography } from "@mui/material";

import { useNavigation } from "../../common/Layout/NavStack";

// import { Requests } from "./Requests";
import { useStyles } from "./styles";

export const SearchUsers = ({
  allChats,
  requests,
}: {
  allChats: EnrichedInboxDb[];
  requests: { received: RemoteUserData[]; sent: RemoteUserData[] };
}) => {
  const classes = useStyles();
  const [searchFilter, setSearchFilter] = useState("");
  const friends = allChats.filter((x: any) => x.areFriends === 1);
  const theme = useCustomTheme();

  const filteredFriends = friends
    .filter((x: EnrichedInboxDb) => x.remoteUsername.includes(searchFilter))
    .map((x: EnrichedInboxDb) => ({
      image: x.remoteUserImage,
      id: x.remoteUserId,
      username: x.remoteUsername,
      areFriends: x.areFriends ? true : false,
      requested: x.requested ? true : false,
      remoteRequested: x.remoteRequested ? true : false,
    }));

  return (
    <div className={classes.container}>
      <TextInput
        className={classes.searchField}
        placeholder={"Search"}
        startAdornment={
          <SearchIcon sx={{ color: theme.custom.colors.icon, mr: "10px" }} />
        }
        value={searchFilter}
        setValue={async (e) => {
          const prefix = e.target.value;
          setSearchFilter(prefix);
        }}
        inputProps={{
          style: {
            height: "48px",
          },
        }}
      />
      {filteredFriends.length > 0 ? (
        <div style={{ marginTop: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}
          >
            <Typography color={theme.custom.colors.fontColor} fontSize={14}>
              Your contacts
            </Typography>
            {requests.received.length > 0 && (
              <RequestHeader requests={requests} />
            )}
          </div>
          <UserList users={filteredFriends as RemoteUserData[]} />
        </div>
      ) : (
        <>
          {requests.received.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <div></div>
              <RequestHeader requests={requests} />
            </div>
          )}
          <EmptyState
            icon={(props: any) => (
              <ContactsIcon fill={theme.custom.colors.icon} {...props} />
            )}
            title={
              searchFilter === ""
                ? "No contacts"
                : `No results for '${searchFilter}'`
            }
            subtitle={searchFilter === "" ? "Search for people to add." : ""}
          />
        </>
      )}
      {/* <br />
      <div style={{ color: theme.custom.colors.fontColor }}>Requests</div>
      <Requests searchFilter={searchFilter} /> */}
    </div>
  );
};

const RequestHeader = ({
  requests,
}: {
  requests: { received: RemoteUserData[]; sent: RemoteUserData[] };
}) => {
  const theme = useCustomTheme();
  const nav = useNavigation();
  return (
    <Typography
      sx={{ cursor: "pointer" }}
      color={theme.custom.colors.fontColor3}
      fontSize={14}
      onClick={() =>
        nav.push("contact-requests", {
          description: (
            <>
              These people wanted to add you as a contact.
              <br /> Click someone to view their profile.
            </>
          ),
          requests,
        })
      }
    >
      Requests ({requests.received.length})
    </Typography>
  );
};
