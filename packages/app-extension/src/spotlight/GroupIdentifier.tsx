import { PushDetail } from "@coral-xyz/react-common";
import { useCustomTheme } from "@coral-xyz/themes";

export const GroupIdentifier = ({ name }: { name: string }) => {
  const theme = useCustomTheme();
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div style={{ color: theme.custom.colors.icon }}>{name}</div>
      <div>
        <PushDetail />
      </div>
    </div>
  );
};
