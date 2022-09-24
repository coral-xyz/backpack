import { ArrowBack } from "@mui/icons-material";
import type { FunctionComponent } from "react";

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
  return (
    <section
      style={{
        borderRadius: "12px",
        display: visible ? "block" : "none",
        height: "100%",
        left: 0,
        position: "absolute",
        width: "100%",
      }}
    >
      <iframe
        style={{ border: "none", height: "100%", width: "100%" }}
        src={uri}
      />
      <ArrowBack
        sx={{
          cursor: "pointer",
          position: "absolute",
          left: "12px",
          top: "32px",
        }}
        onClick={onClose}
      />
    </section>
  );
};

export default WaitingRoom;
