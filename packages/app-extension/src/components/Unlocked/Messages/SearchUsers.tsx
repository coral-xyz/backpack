import { useEffect, useState } from "react";
import type { EnrichedInboxDb } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { TextInput } from "@coral-xyz/react-common";

import { useStyles } from "./styles";
import { UserList } from "./UserList";
import { useContacts } from "@coral-xyz/db";
import {useUser} from "@coral-xyz/recoil";

export const SearchUsers = () => {
  const {uuid} = useUser();
  const classes = useStyles();
  const [searchFilter, setSearchFilter] = useState("");
  const contacts = useContacts(uuid);
  const filteredContacts = contacts
    .filter((x: EnrichedInboxDb) => x.remoteUsername.includes(searchFilter))
    .map((x: EnrichedInboxDb) => ({
      image: x.remoteUserImage,
      id: x.remoteUserId,
      username: x.remoteUsername,
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
      {filteredContacts.length !== 0 && <UserList users={filteredContacts} />}
    </div>
  );
};
