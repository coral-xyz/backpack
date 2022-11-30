import { BACKEND_API_URL } from "@coral-xyz/common";
import { TextInput } from "../../common/Inputs";
import { useStyles } from "./styles";
import { useState } from "react";
import { UserList } from "./UserList";

export const SearchUsers = () => {
  const classes = useStyles();
  const [searchFilter, setSearchFilter] = useState("");
  const [searchResults, setSearchResults] = useState<
    { image: string; id: string; username: string }[]
  >([]);

  return (
    <div className={classes.container}>
      <div className={classes.text}>Send to</div>
      <TextInput
        className={classes.searchField}
        placeholder={"Search"}
        value={searchFilter}
        setValue={async (e) => {
          const prefix = e.target.value;
          setSearchFilter(prefix);
          if (prefix.length >= 3) {
            //TODO debounce
            const res = await fetch(
              `${BACKEND_API_URL}/users?usernamePrefix=${prefix}`
            );
            const json = await res.json();
            setSearchResults(json.users || []);
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
      <UserList users={searchResults} />
    </div>
  );
};
