import { useCustomTheme } from "@coral-xyz/themes";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";

export function ActionCard({
  icon,
  text,
  textAdornment,
  subtext,
  onClick,
  disabled = false,
}: {
  icon?: any;
  text: string;
  textAdornment?: React.ReactNode;
  subtext?: string;
  onClick: () => void;
  disabled?: boolean;
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
        width: "100%",
        opacity: disabled ? 0.5 : 1,
      }}
      disabled={disabled}
    >
      <Card
        sx={{
          p: 1,
          color: theme.custom.colors.fontColor,
          cursor: "pointer",
          padding: "16px",
          boxShadow: "none",
          backgroundColor: "transparent",
          width: "100%",
        }}
      >
        <CardContent style={{ padding: 0 }}>
          {icon ? <Box sx={{ mb: 1, display: "flex" }}>{icon}</Box> : null}
          <Box
            style={{
              fontWeight: 500,
              fontSize: "16px",
              lineHeight: "24px",
              textAlign: "left",
            }}
          >
            {text}
            {textAdornment}
            {subtext ? (
              <Typography
                style={{
                  fontSize: "14px",
                  color: theme.custom.colors.fontColor3,
                }}
              >
                {subtext}
              </Typography>
            ) : null}
          </Box>
        </CardContent>
      </Card>
    </Button>
  );
}
