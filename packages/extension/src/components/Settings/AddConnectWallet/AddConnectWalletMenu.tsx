import { Box, Grid, SvgIcon } from "@mui/material";
import { AddCircle, ArrowCircleDown } from "@mui/icons-material";
import { ActionCard } from "../../Layout/ActionCard";
import { HardwareWalletIcon } from "../../Icon";
import type { AddConnectFlows } from "./";
import { Header, SubtextParagraph } from "../../common";
import { openConnectHardware } from "@coral-xyz/common";

export function AddConnectWalletMenu({
  onSelect,
}: {
  onSelect: (action: AddConnectFlows) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box sx={{ margin: "24px" }}>
        <Header text="Add or connect a wallet" />
        <SubtextParagraph>Add new wallets to Backpack.</SubtextParagraph>
      </Box>
      <Box sx={{ margin: "0 16px" }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <ActionCard
              icon={<AddCircle />}
              text="Create a new wallet"
              onClick={() => onSelect("create-new-wallet")}
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
              onClick={openConnectHardware}
            />
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}
