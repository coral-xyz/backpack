import { useCustomTheme } from "@coral-xyz/themes";

export const TokenBadge = ({
  onClick,
  label,
  overwriteBackground,
  fontSize,
}: {
  onClick: any;
  label: string;
  overwriteBackground?: string;
  fontSize?: number;
}) => {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        userSelect: "none",
        cursor: "pointer",
        background: overwriteBackground || theme.custom.colors.background,
        color: theme.custom.colors.fontColor,
        padding: "4px 8px",
        borderRadius: 4,
        display: "inline-flex",
        fontSize,
      }}
      onClick={onClick}
    >
      {label}
    </div>
  );
};
