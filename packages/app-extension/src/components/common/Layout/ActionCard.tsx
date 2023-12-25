import { useTheme } from "@coral-xyz/tamagui";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";

import { Checkbox } from "..";

export function ActionCard({
  icon,
  checked,
  text,
  textAdornment,
  subtext,
  onClick,
  disabled = false,
}: {
  icon?: any;
  checked?: boolean;
  text: string;
  textAdornment?: React.ReactNode;
  subtext?: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <Button
      disableRipple
      onClick={onClick}
      style={{
        padding: 0,
        textTransform: "none",
        border: `${theme.baseBorderLight.val}`,
        borderRadius: "12px",
        background: theme.baseBackgroundL1.val,
        width: "100%",
        opacity: disabled ? 0.5 : 1,
      }}
      disabled={disabled}
    >
      <Card
        sx={{
          p: 1,
          color: theme.baseTextHighEmphasis.val,
          cursor: "pointer",
          padding: "16px",
          boxShadow: "none",
          backgroundColor: "transparent",
          width: "100%",
        }}
      >
        <CardContent style={{ padding: 0 }}>
          {icon || typeof checked !== "undefined" ? (
            <Box sx={{ mb: 1, display: "flex" }}>
              {icon}
              {typeof checked !== "undefined" ? (
                <Checkbox
                  checked={checked}
                  setChecked={onClick}
                  style={{
                    position: "absolute",
                    right: "18px",
                    top: icon ? "18px" : "auto",
                  }}
                />
              ) : null}
            </Box>
          ) : null}
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
                  color: theme.baseTextMedEmphasis.val,
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
