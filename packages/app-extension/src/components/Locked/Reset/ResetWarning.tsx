import { useEffect } from "react";
import { Box } from "@mui/material";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { UI_RPC_METHOD_KEYRING_RESET } from "@coral-xyz/common";
import {
  Header,
  HeaderIcon,
  SubtextParagraph,
  DangerButton,
  SecondaryButton,
} from "../../common";
import { WarningIcon } from "../../common/Icon";
import { useNavStack } from "../../common/Layout/NavStack";
import { useDrawerContext } from "../../common/Layout/Drawer";

export function ResetWarning() {
  const theme = useCustomTheme();
  const background = useBackgroundClient();
  const nav = useNavStack();
  const { close } = useDrawerContext();
  const onNext = async () => {
    await background.request({
      method: UI_RPC_METHOD_KEYRING_RESET,
      params: [],
    });
  };
  useEffect(() => {
    nav.setTitle("");
  }, []);
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
        <HeaderIcon icon={<WarningIcon />} />
        <Header text="Reset your recovery phrase" />
        <SubtextParagraph>
          This will remove all wallets and replace them with a new wallet.
          Ensure you have your existing secret recovery phrase and private keys
          saved.
        </SubtextParagraph>
      </Box>
      <Box
        sx={{
          marginLeft: "16px",
          marginRight: "16px",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ width: "167.5px" }}>
          <SecondaryButton
            label="Cancel"
            onClick={close}
            style={{
              border: `solid 1pt ${theme.custom.colors.borderColor}`,
            }}
          />
        </Box>
        <Box sx={{ width: "167.5px" }}>
          <DangerButton label="Reset" onClick={() => onNext()} />
        </Box>
      </Box>
    </Box>
  );
}
