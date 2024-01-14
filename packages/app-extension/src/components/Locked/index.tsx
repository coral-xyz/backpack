import { Backpack, RedBackpack } from "@coral-xyz/react-common";
import { useTheme } from "@coral-xyz/tamagui";
import { Box, Typography } from "@mui/material";

export function BackpackHeader({
  forceWhite,
  style,
  disableBackpackLabel,
}: {
  disableUsername?: boolean;
  disableBackpackLabel?: boolean;
  forceWhite?: boolean;
  style?: React.CSSProperties;
}) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        marginTop: "16px",
        marginLeft: "auto",
        marginRight: "auto",
        display: "block",
        position: "relative",
        ...style,
      }}
    >
      <div style={{ display: "flex" }}>
        <RedBackpack
          style={{
            marginBottom: "32px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      </div>
      {!disableBackpackLabel ? (
        <Backpack
          fill={forceWhite ? "white" : theme.baseTextHighEmphasis.val}
        />
      ) : null}
      <Typography
        sx={{
          textAlign: "center",
          lineHeight: "24px",
          fontSize: "16px",
          fontWeight: "500",
          color: forceWhite ? "white" : theme.baseTextMedEmphasis.val,
          marginTop: "8px",
        }}
      />
    </Box>
  );
}
