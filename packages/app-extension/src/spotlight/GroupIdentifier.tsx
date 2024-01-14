import { PushDetail } from "@coral-xyz/react-common";
import { useTheme } from "@coral-xyz/tamagui";

export const GroupIdentifier = ({ name }: { name: string }) => {
  const theme = useTheme();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 4,
      }}
    >
      <div style={{ color: theme.baseIcon.val }}>{name}</div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <PushDetail style={{ width: "22px" }} />
      </div>
    </div>
  );
};
