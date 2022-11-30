import { CloseButton, WithDrawer } from "../../common/Layout/Drawer";
import {
  NavStackEphemeral,
  NavStackScreen,
} from "../../common/Layout/NavStack";
import { SearchUsers } from "./SearchUsers";
import { ChatScreen } from "./ChatScreen";
import { ProfileScreen } from "./ProfileScreen";

export const NewMessageModal = ({
  newSettingsModal,
  setNewSettingsModal,
}: any) => {
  return (
    <>
      <WithDrawer
        openDrawer={newSettingsModal}
        setOpenDrawer={setNewSettingsModal}
      >
        <div style={{ height: "100%" }}>
          <NavStackEphemeral
            initialRoute={{ name: "root", title: "New message" }}
            options={() => ({ title: "" })}
            navButtonLeft={
              <CloseButton onClick={() => setNewSettingsModal(false)} />
            }
          >
            <NavStackScreen
              name={"root"}
              component={(props: any) => <SearchUsers {...props} />}
            />
          </NavStackEphemeral>
        </div>
      </WithDrawer>
    </>
  );
};
