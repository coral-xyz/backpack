import { TextInput } from "../../common/Inputs";
import { styles } from "@coral-xyz/themes";
import { NewMessageModal } from "./NewMessageModal";
import { useEffect, useState } from "react";
import { MessagesSkeleton } from "./MessagesSkeleton";
import { MessageList } from "./MessageList";
import { BACKEND_API_URL, EnrichedInboxDb } from "@coral-xyz/common";
import AddIcon from "@mui/icons-material/Add";
import { useStyles } from "./styles";

export function Inbox() {
  const classes = useStyles();
  const [searchFilter, setSearchFilter] = useState("");
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [activeChats, setActiveChats] = useState<EnrichedInboxDb[]>([]);
  const [newSettingsModal, setNewSettingsModal] = useState(false);

  const init = async () => {
    const res = await fetch(`${BACKEND_API_URL}/inbox`);
    const json = await res.json();
    setMessagesLoading(false);
    setActiveChats(json.chats || []);
  };

  useEffect(() => {
    init();
  }, []);

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
      <div style={{ display: "flex", marginBottom: 5 }}>
        <div>New Message</div>{" "}
        <div
          className={classes.roundBtn}
          onClick={() => setNewSettingsModal(true)}
        >
          {" "}
          <AddIcon className={classes.add} />{" "}
        </div>
      </div>
      {messagesLoading && <MessagesSkeleton />}
      {!messagesLoading && (
        <MessageList
          activeChats={activeChats.filter(
            (x) =>
              x.user2Username.includes(searchFilter) ||
              x.user1Username.includes(searchFilter)
          )}
        />
      )}
      <NewMessageModal
        newSettingsModal={newSettingsModal}
        setNewSettingsModal={setNewSettingsModal}
      />
    </div>
  );
}
