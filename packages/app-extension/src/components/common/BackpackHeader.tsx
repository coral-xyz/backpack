import { useCustomTheme } from "@coral-xyz/themes";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { Backpack } from "./Icon";

export function BackpackHeader({
  alphaStyle,
}: {
  alphaStyle?: React.CSSProperties;
}) {
  const theme = useCustomTheme();
  return (
    <Box
      sx={{
        marginTop: "40px",
        marginLeft: "auto",
        marginRight: "auto",
        display: "block",
        position: "relative",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row-reverse",
          marginBottom: "4px",
          marginRight: "58px",
          ...alphaStyle,
        }}
      >
        <AlphaLabel />
      </Box>
      <Backpack fill={theme.custom.colors.fontColor} />
      <Typography
        sx={{
          textAlign: "center",
          lineHeight: "24px",
          fontSize: "16px",
          fontWeight: "500",
          color: theme.custom.colors.secondary,
          marginTop: "8px",
        }}
      >
        A home for your xNFTs
      </Typography>
    </Box>
  );
}

function AlphaLabel() {
  const theme = useCustomTheme();
  return (
    <Box
      sx={{
        borderRadius: "10px",
        border: `solid 1pt ${theme.custom.colors.alpha}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "20px",
        width: "53px",
      }}
    >
      <Typography
        sx={{
          color: theme.custom.colors.alpha,
          fontSize: "12px",
          lineHeight: "16px",
          textAlign: "center",
          fontWeight: 500,
        }}
      >
        Alpha
      </Typography>
    </Box>
  );
}
