import { useEffect, useState } from "react";
import type { EnrichedInboxDb, RemoteUserData } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { useContacts } from "@coral-xyz/db";
import { TextInput } from "@coral-xyz/react-common";
import { useUser } from "@coral-xyz/recoil";

import { useStyles } from "./styles";
import { UserList } from "./UserList";

export const SearchUsers = () => {
  const { uuid } = useUser();
  const classes = useStyles();
  const [searchFilter, setSearchFilter] = useState("");
  const contacts = useContacts(uuid);

  const filteredContacts = contacts
    .filter((x: EnrichedInboxDb) => x.remoteUsername.includes(searchFilter))
    .map((x: EnrichedInboxDb) => ({
      image: x.remoteUserImage,
      id: x.remoteUserId,
      username: x.remoteUsername,
      areFriends: x.areFriends ? true : false,
    }));

  return (
    <div className={classes.container}>
      <TextInput
        className={classes.searchField}
        placeholder={"Search"}
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
      {filteredContacts.length !== 0 && (
        <UserList users={filteredContacts as RemoteUserData[]} />
      )}
    </div>
  );
};
