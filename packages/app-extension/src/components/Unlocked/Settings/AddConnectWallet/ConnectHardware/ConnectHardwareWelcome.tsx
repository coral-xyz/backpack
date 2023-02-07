import { useState } from 'react';
import { HardwareWalletIcon, PrimaryButton } from "@coral-xyz/react-common";
import { Box, Grid } from "@mui/material";

import { Header, HeaderIcon, SubtextParagraph } from "../../../../common";
import { KeystoneIcon, USBIcon } from '../../../../common/Icon';
import { ActionCard } from '../../../../common/Layout/ActionCard';
import { HardwareType } from "../../../../Onboarding/pages/HardwareOnboard";

function CheckBadge() {
  return (
    <div
      style={{
        display: "inline-block",
        position: "relative",
        top: "4px",
        left: "5px",
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 1.5C4.86 1.5 1.5 4.86 1.5 9C1.5 13.14 4.86 16.5 9 16.5C13.14 16.5 16.5 13.14 16.5 9C16.5 4.86 13.14 1.5 9 1.5ZM6.9675 12.2175L4.275 9.525C3.9825 9.2325 3.9825 8.76 4.275 8.4675C4.5675 8.175 5.04 8.175 5.3325 8.4675L7.5 10.6275L12.66 5.4675C12.9525 5.175 13.425 5.175 13.7175 5.4675C14.01 5.76 14.01 6.2325 13.7175 6.525L8.025 12.2175C7.74 12.51 7.26 12.51 6.9675 12.2175Z"
          fill="#42C337"
        />
      </svg>
    </div>
  );
}

export function ConnectHardwareWelcome({
  onNext,
}: {
  onNext: (type: HardwareType) => void;
}) {
  const [hardware, setHardware] = useState<HardwareType>();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ margin: "0 24px" }}>
        <HeaderIcon icon={<HardwareWalletIcon />} />
        <Header text="Connect a hardware wallet" />
        <SubtextParagraph>
          Use your hardware wallet with Backpack.
        </SubtextParagraph>
        <Grid container spacing={1.5} mt={4}>
          <Grid item xs={6}>
            <ActionCard
              icon={<USBIcon />}
              text="USB Devices"
              textAdornment={
                hardware === HardwareType.Ledger ? (
                  <CheckBadge />
                ) : ''
              }
              onClick={() => setHardware(HardwareType.Ledger)}
            />
          </Grid>
          <Grid item xs={6}>
            <ActionCard
              icon={<KeystoneIcon />}
              text="Keystone"
              textAdornment={
                hardware === HardwareType.Keystone ? (
                  <CheckBadge />
                ) : ''
              }
              onClick={() => setHardware(HardwareType.Keystone)}
            />
          </Grid>
        </Grid>
      </Box>
      <Box
        sx={{
          marginLeft: "16px",
          marginRight: "16px",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "column",
        }}
      >
        <PrimaryButton
          label="Next"
          disabled={!hardware}
          onClick={() => hardware && onNext(hardware)}
        />
      </Box>
    </Box>
  );
}
