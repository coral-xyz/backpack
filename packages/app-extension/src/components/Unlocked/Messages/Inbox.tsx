import { TextInput } from "../../common/Inputs";
import { styles } from "@coral-xyz/themes";
import { useEffect, useState } from "react";
import { MessagesSkeleton } from "./MessagesSkeleton";
import { MessageList } from "./MessageList";

const useStyles = styles((theme) => ({
  searchField: {
    marginTop: "16px",
    marginBottom: "16px",
    width: "inherit",
    display: "flex",
    "& .MuiOutlinedInput-root": {
      "& input": {
        paddingTop: 0,
        paddingBottom: 0,
      },
    },
  },
  container: {
    marginLeft: "12px",
    marginRight: "12px",
  },
}));

export function Inbox() {
  const classes = useStyles();
  const [searchFilter, setSearchFilter] = useState("");
  const [messagesLoading, setMessagesLoading] = useState(true);

  useEffect(() => {
    // setMessagesLoading([]);
  });

  return (
    <div className={classes.container}>
      <TextInput
        className={classes.searchField}
        placeholder={"Search"}
        value={searchFilter}
        setValue={(e) => setSearchFilter(e.target.value)}
        inputProps={{
          style: {
            height: "48px",
          },
        }}
      />
      {messagesLoading && <MessagesSkeleton />}
      {!messagesLoading && <MessageList />}
    </div>
  );
}
