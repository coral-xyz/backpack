import { useState } from "react";
import { Box } from "@mui/material";
import { PrimaryButton, LinkButton } from "../../common";
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
          <Box sx={{ mb: "16px" }}>
            <PrimaryButton
              label="Create a new wallet"
              onClick={onClickCreate}
            />
          </Box>
          <LinkButton
            label="Import an existing wallet"
            onClick={onClickImport}
          />
        </Box>
      </div>
    </WithNav>
  );
};
