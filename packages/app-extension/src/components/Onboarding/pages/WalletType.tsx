import { AddCircle, ArrowCircleDown } from "@mui/icons-material";
import { Box, Grid } from "@mui/material";
import { useCustomTheme } from "@coral-xyz/themes";
import { toTitleCase } from "@coral-xyz/common";
import { ActionCard } from "../../common/Layout/ActionCard";

export const WalletType = ({
  action,
  onNext,
}: {
  action: "create" | "import";
  onNext: (walletType: string) => void;
}) => {
  const theme = useCustomTheme();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box style={{ padding: "0 16px 16px" }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <ActionCard
              icon={
                <AddCircle
                  style={{
                    color: theme.custom.colors.icon,
                  }}
                />
              }
              text={`${toTitleCase(action)} from recovery phrase`}
              onClick={() => onNext("mnemonic")}
            />
          </Grid>
          <Grid item xs={6}>
            <ActionCard
              icon={
                <ArrowCircleDown
                  style={{
                    color: theme.custom.colors.icon,
                  }}
                />
              }
              text={`${toTitleCase(action)} from hardware wallet`}
              onClick={() => onNext("ledger")}
            />
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};
