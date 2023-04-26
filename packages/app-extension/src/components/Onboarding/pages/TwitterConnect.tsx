import { PrimaryButton } from "@coral-xyz/react-common";
import { useCustomTheme } from "@coral-xyz/themes";
import SettingsEthernetIcon from "@mui/icons-material/SettingsEthernetRounded";
import { Box, Button, Typography } from "@mui/material";

import { RedBackpack, TwitterIcon } from "../../common/Icon";

export function TwitterConnect() {
  const theme = useCustomTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        mx: "24px",
        py: "16px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          mb: "32px",
        }}
      >
        <RedBackpack style={{ height: 40, width: 40 }} />
        <SettingsEthernetIcon
          sx={{ height: 30, width: 30, color: theme.custom.colors.icon }}
        />
        <TwitterIcon fill="#1DA1F2" style={{ height: 40, width: 40 }} />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography
          sx={{
            color: theme.custom.colors.fontColor,
            fontSize: "24px",
            mb: "8px",
          }}
        >
          Connect with Twitter
        </Typography>
        <Typography
          sx={{ color: theme.custom.colors.secondary, fontSize: "16px" }}
        >
          Find and add people you know on Backpack.
        </Typography>
      </Box>
      <Box sx={{}}>
        <PrimaryButton sx={{ mb: "16px" }} label="Continue to Twitter" />
        <Button
          disableRipple
          disableFocusRipple
          disableElevation
          sx={{
            width: "100%",
            color: theme.custom.colors.secondary,
            textTransform: "none",
            textAlign: "center",
            fontSize: "16px",
            "&:hover": { background: "none !important" },
          }}
        >
          Maybe Later
        </Button>
      </Box>
    </Box>
  );
}
