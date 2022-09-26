import { Button, Typography, Box, Card, CardContent } from "@mui/material";
import { useCustomTheme } from "@coral-xyz/themes";

export function ActionCard({
  icon,
  text,
  onClick,
}: {
  icon: any;
  text: string;
  onClick: () => void;
}) {
  const theme = useCustomTheme();
  return (
    <Button
      disableRipple
      onClick={onClick}
      style={{
        padding: 0,
        textTransform: "none",
        border: `${theme.custom.colors.borderFull}`,
        borderRadius: "12px",
        background: theme.custom.colors.nav,
      }}
    >
      <Card
        sx={{
          p: 1,
          color: theme.custom.colors.fontColor,
          cursor: "pointer",
          height: "112px",
          padding: "16px",
          boxShadow: "none",
          backgroundColor: "transparent",
        }}
      >
        <CardContent style={{ padding: 0 }}>
          <Box sx={{ mb: 1, display: "flex" }}>{icon}</Box>
          <Box>
            <Typography
              style={{
                fontWeight: 500,
                fontSize: "16px",
                lineHeight: "24px",
                textAlign: "left",
              }}
            >
              {text}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Button>
  );
}
