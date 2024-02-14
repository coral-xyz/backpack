import { useTheme } from "@coral-xyz/tamagui";

export const TokenBadge = ({
  onClick,
  label,
  overwriteBackground,
  overwriteColor,
  fontSize,
  style,
}: {
  onClick: any;
  label: string;
  overwriteBackground?: string;
  overwriteColor?: string;
  fontSize?: number;
  style?: any;
}) => {
  const theme = useTheme();
  return (
    <div
      style={{
        userSelect: "none",
        cursor: "pointer",
        background: overwriteBackground || theme.baseBackgroundL1.val,
        color: overwriteColor || theme.baseTextHighEmphasis.val,
        padding: "4px 8px",
        borderRadius: 4,
        display: "inline-flex",
        fontSize,
        ...style,
      }}
      onClick={onClick}
    >
      {label}
    </div>
  );
};
