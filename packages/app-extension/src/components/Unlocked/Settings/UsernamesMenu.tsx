import { ProxyImage } from "@coral-xyz/react-common";
import { useTheme } from "@coral-xyz/tamagui";

function MiniAvatarIcon({ avatarUrl }: { avatarUrl: string }) {
  const theme = useTheme();
  return (
    <div
      style={{
        background: theme.baseIconHover.val,
        width: "28px",
        height: "28px",
        borderRadius: "14px",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <ProxyImage
        src={avatarUrl}
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "12px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      />
    </div>
  );
}
