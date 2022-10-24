import { useState } from "react";
import { useCustomTheme } from "@coral-xyz/themes";
import { AddCircle, ArrowCircleDown } from "@mui/icons-material";
import { Box, Grid } from "@mui/material";
import { ActionCard } from "../../common/Layout/ActionCard";
import { WithNav } from "../../common/Layout/Nav";
import { BackpackHeader } from "../../Locked";
import { OnboardingMenu } from "../";

export const CreateOrImportWallet = ({
  onClickCreate,
  onClickImport,
  containerRef,
  navProps,
}: {
  onClickCreate: () => void;
  onClickImport: () => void;
  containerRef: any;
  navProps: object;
}) => {
  const theme = useCustomTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <WithNav
      navButtonRight={
        <OnboardingMenu
          containerRef={containerRef}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
        />
      }
      {...navProps}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Box style={{ flex: 1, textAlign: "center", padding: "0 16px" }}>
          <BackpackHeader
            alphaStyle={{
              marginRight: "42px",
            }}
          />
        </Box>
        <Box style={{ padding: "0 16px 16px" }}>
          <Grid container spacing={1.5}>
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
                onClick={onClickCreate}
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
                onClick={onClickImport}
              />
            </Grid>
          </Grid>
        </Box>
      </div>
    </WithNav>
  );
};
