import type { FunctionComponent } from "react";

interface WaitingRoomProps {
  uri: string;
  visible?: boolean;
}

const WaitingRoom: FunctionComponent<WaitingRoomProps> = ({ uri, visible }) => {
  return (
    <iframe
      style={{
        border: "none",
        borderRadius: "12px",
        display: visible ? "block" : "none",
        height: "100%",
        left: 0,
        position: "absolute",
        width: "100%",
      }}
      src={uri}
    />
  );
};

export default WaitingRoom;
