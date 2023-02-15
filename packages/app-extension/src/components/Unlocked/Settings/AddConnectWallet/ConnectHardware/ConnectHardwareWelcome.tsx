import type { MutableRefObject} from 'react';
import { useState } from 'react';
import { useCustomTheme } from '@coral-xyz/themes';
import { Box, Button, Stack, SvgIcon } from "@mui/material";

import { Header, SubtextParagraph } from "../../../../common";
import { KeystoneIcon, USBIcon } from '../../../../common/Icon';
import { ActionCard } from '../../../../common/Layout/ActionCard';
import { WithContaineredDrawer } from '../../../../common/Layout/Drawer';
import { HardwareType } from "../../../../Onboarding/pages/HardwareOnboard";

export function ConnectHardwareWelcome({
  containerRef,
  onNext,
}: {
  containerRef: MutableRefObject<any>;
  onNext: (type: HardwareType) => void;
}) {
  const [isKeystoneIntroOpen, setIsKeystoneIntroOpen] = useState(false);
  const theme = useCustomTheme();

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
        <Header text="Connect a hardware wallet" />
        <SubtextParagraph>
          Use your hardware wallet with Backpack.
        </SubtextParagraph>
        <Stack spacing={2} mt={4}>
          <ActionCard
            icon={<USBIcon />}
            text="USB Devices"
            onClick={() => onNext(HardwareType.Ledger)}
            direction="row"
          />
          <ActionCard
            icon={<KeystoneIcon />}
            text="Keystone"
            textAdornment={
              <SvgIcon
                viewBox="0 0 20 20"
                sx={{
                  width: "20px",
                  height: "20px",
                  fill: "none",
                  position: "absolute",
                  right: "16px",
                  top: "50%",
                  marginTop: "-10px",
                  color: "#C2C4CB",
                  "&:hover": { color: theme.custom.colors.fontColor }
                }}
                onClick={e => {
                  e.stopPropagation();
                  setIsKeystoneIntroOpen(true);
                }}
              >
                <circle cx="10" cy="6" r="1" fill="currentColor" />
                <rect x="9" y="9" width="2" height="7" rx="1" fill="currentColor" />
                <rect x="1" y="1" width="18" height="18" rx="9" stroke="currentColor" stroke-width="2" />
              </SvgIcon>
            }
            onClick={() => onNext(HardwareType.Keystone)}
            direction="row"
          />
        </Stack>
      </Box>
      <WithContaineredDrawer
        containerRef={containerRef}
        backdropStyles={{
          background: "rgba(4, 10, 24, 0.4)",
        }}
        openDrawer={isKeystoneIntroOpen}
        setOpenDrawer={setIsKeystoneIntroOpen}
      >
        <Box p={2} sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "#fff",
          borderRadius: "12px",
        }}>
          <KeystoneIcon />
          <Box>Keystone is a top-notch hardware wallet for optimal security, user-friendly interface and extensive compatibility.</Box>
          <Box>learn more</Box>
          <Button onClick={() => setIsKeystoneIntroOpen(false)}>OK</Button>
        </Box>
      </WithContaineredDrawer>
    </Box>
  );
}
