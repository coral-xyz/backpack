import { useEffect, useState } from "react";
import type { EnrichedInboxDb } from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  NAV_COMPONENT_MESSAGE_PROFILE,
  NAV_COMPONENT_MESSAGE_REQUESTS,
} from "@coral-xyz/common";
import { useNavigation } from "@coral-xyz/recoil";
import { styles } from "@coral-xyz/themes";
import AddIcon from "@mui/icons-material/Add";

import { TextInput } from "../../common/Inputs";

import { MessageList } from "./MessageList";
import { MessagesSkeleton } from "./MessagesSkeleton";
import { NewMessageModal } from "./NewMessageModal";
import { useStyles } from "./styles";

export function Inbox() {
  const classes = useStyles();
  const [searchFilter, setSearchFilter] = useState("");
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [activeChats, setActiveChats] = useState<EnrichedInboxDb[]>([]);
  const [newSettingsModal, setNewSettingsModal] = useState(false);
  const { push } = useNavigation();

  const init = async () => {
    const res = await fetch(`${BACKEND_API_URL}/inbox?areConnected=true`);
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
      <div
        style={{
          display: "flex",
          marginBottom: 10,
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex" }}>
          <div className={classes.text}>New Message</div>{" "}
          <div
            className={classes.roundBtn}
            onClick={() => setNewSettingsModal(true)}
          >
            {" "}
            <AddIcon className={classes.add} />{" "}
          </div>
        </div>
        <div>
          <div
            className={classes.text}
            style={{ cursor: "pointer" }}
            onClick={() => {
              push({
                title: `Requests`,
                componentId: NAV_COMPONENT_MESSAGE_REQUESTS,
                componentProps: {},
              });
            }}
          >
            View Requests
          </div>
        </div>
      </div>
      {messagesLoading && <MessagesSkeleton />}
      {!messagesLoading && (
        <MessageList
          activeChats={activeChats.filter((x) =>
            x.remoteUsername.includes(searchFilter)
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
