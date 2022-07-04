import { Box, Grid, SvgIcon } from "@mui/material";
import { AddCircle, ArrowCircleDown } from "@mui/icons-material";
import { useCustomTheme } from "@coral-xyz/themes";
import { ActionCard } from "../Layout/ActionCard";
import { BackpackHeader } from "../Locked";
import { HardwareWalletIcon } from "../Icon";
import type { OnboardingFlows } from "./";

export function OnboardingWelcome({
  onSelect,
}: {
  onSelect: (flow: OnboardingFlows) => void;
}) {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        background: theme.custom.colors.nav,
        display: "flex",
        textAlign: "center",
        justifyContent: "space-between",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box>
        <BackpackHeader />
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <ActionCard
            icon={<AddCircle />}
            text="Create a new wallet"
            onClick={() => onSelect("create-wallet")}
          />
        </Grid>
        <Grid item xs={6}>
          <ActionCard
            icon={<ArrowCircleDown />}
            text="Import an existing wallet"
            onClick={() => onSelect("import-wallet")}
          />
        </Grid>
        <Grid item xs={6}>
          <ActionCard
            icon={
              <HardwareWalletIcon
                fill="#fff"
                style={{
                  width: "24px",
                  height: "24px",
                }}
              />
            }
            text="Connect a hardware wallet"
            onClick={() => onSelect("connect-hardware")}
          />
        </Grid>
      </Grid>
    </div>
  );
}
