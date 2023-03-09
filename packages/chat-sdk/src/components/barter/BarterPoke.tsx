import { useCustomTheme } from "@coral-xyz/themes";

import { useChatContext } from "../ChatContext";

export function BarterPoke({ barterId }: { barterId: string }) {
  const { remoteUsername } = useChatContext();
  const theme = useCustomTheme();
  return (
    <div
      style={{
        background: theme.custom.colors.linkColor,
        padding: "12px 16px",
        color: "#fff",
        borderRadius: 16,
      }}
    >
      <div>{remoteUsername} wants to trade </div>
      <div
        onClick={() => {
          barterId;
        }}
      >
        View{" "}
      </div>
    </div>
  );
}
