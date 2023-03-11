import { useCustomTheme } from "@coral-xyz/themes";
import { Box, Card, CardContent, Checkbox, Typography } from "@mui/material";

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
  const label = { inputProps: { "aria-label": "Checkbox demo" } };
  return (
    <Card
      sx={{
        p: 1,
        color: theme.custom.colors.fontColor,
        padding: "16px",
        boxShadow: "none",
        backgroundColor: "transparent",
        textTransform: "none",
        border: `${theme.custom.colors.borderFull}`,
        borderRadius: "12px",
        background: theme.custom.colors.nav,
        width: "100%",
        opacity: disabled ? 0.5 : 1,
        position: "relative",
      }}
    >
      <CardContent style={{ padding: 0 }}>
        <Box
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            cursor: "pointer",
          }}
        >
          <Checkbox
            {...label}
            onClick={onClick}
            icon={textAdornment}
            checkedIcon={textAdornment}
          />
        </Box>
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
  );
}
