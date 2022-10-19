import { useCustomTheme } from "@coral-xyz/themes";
import { AddCircle, ArrowCircleDown } from "@mui/icons-material";
import { Box, Grid } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { toTitleCase } from "@coral-xyz/common";
import { ActionCard } from "../../common/Layout/ActionCard";

export const AccountType = ({ action }: { action: "create" | "import" }) => {
  const { pathname } = useLocation();
  const theme = useCustomTheme();
  const navigate = useNavigate();

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
              onClick={() =>
                navigate(`/${pathname}/mnemonic`.replace("//", "/"))
              }
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
              onClick={() =>
                navigate(`/${pathname}/hardware`.replace("//", "/"))
              }
            />
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};
