import { useCustomTheme } from "@coral-xyz/themes";
import { AddCircle, ArrowCircleDown } from "@mui/icons-material";
import { Box, Grid } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { ActionCard } from "../../common/Layout/ActionCard";
import { BackpackHeader } from "../../Locked";

export const CreateOrImportWallet = () => {
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
      <Box style={{ flex: 1, textAlign: "center", padding: "32px 16px 0" }}>
        <BackpackHeader
          alphaStyle={{
            marginRight: "42px",
          }}
        />
      </Box>
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
              text="Create a new wallet"
              onClick={() => navigate(`${pathname}/create`.replace("//", "/"))}
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
              text="Import an existing wallet"
              onClick={() => navigate(`${pathname}/import`.replace("//", "/"))}
            />
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};
