import { ArrowBack } from "@mui/icons-material";
import type { FunctionComponent } from "react";
import { NavBackButton, WithNav } from "../common/Layout/Nav";

const WAITLIST_RES_ID_KEY = "waitlist-form-res-id";

export const setWaitlistId = (responseId: string) =>
  window.localStorage.setItem(WAITLIST_RES_ID_KEY, responseId);

export const getWaitlistId = () =>
  window.localStorage.getItem(WAITLIST_RES_ID_KEY) ?? undefined;

interface WaitingRoomProps {
  onClose: () => void;
  uri: string;
  visible?: boolean;
}

const WaitingRoom: FunctionComponent<WaitingRoomProps> = ({
  onClose,
  uri,
  visible,
}) => {
  return visible ? (
    <WithNav
      navButtonLeft={<NavBackButton onClick={onClose} />}
      navbarStyle={{
        borderRadius: "12px",
      }}
      navContentStyle={{
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <iframe
        style={{
          border: "none",
          height: "100%",
          width: "100%",
          overflow: "hidden",
        }}
        src={uri}
      />
    </WithNav>
  ) : null;
};

export default WaitingRoom;
