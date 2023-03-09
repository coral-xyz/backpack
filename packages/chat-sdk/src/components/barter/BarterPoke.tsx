import { useUser } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";

import { useChatContext } from "../ChatContext";

export function BarterPoke({
  barterId,
  sender,
}: {
  barterId: string;
  sender: string;
}) {
  const { remoteUsername, setOpenPlugin } = useChatContext();
  const { username, uuid } = useUser();
  const theme = useCustomTheme();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          background: theme.custom.colors.linkColor,
          padding: "12px 16px",
          color: "#fff",
          marginTop: 5,
          borderRadius: 16,
        }}
      >
        <div style={{ flex: 1 }}>
          {sender === uuid
            ? `You poked ${remoteUsername}`
            : `${remoteUsername} wants to trade`}{" "}
        </div>
        <div
          style={{
            marginLeft: 10,
            cursor: "pointer",
            color: theme.custom.colors.icon,
          }}
          onClick={() => {
            setOpenPlugin({
              type: "barter",
              metadata: {
                barterId,
              },
            });
          }}
        >
          View{" "}
        </div>
      </div>
    </div>
  );
}
