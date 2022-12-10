import { useEffect } from "react";
import {
  UI_RPC_METHOD_KEYRING_RESET,
  UI_RPC_METHOD_USER_LOGOUT,
} from "@coral-xyz/common";
import { useBackgroundClient, useUser } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Box } from "@mui/material";

import {
  DangerButton,
  Header,
  HeaderIcon,
  SecondaryButton,
  SubtextParagraph,
} from "../../common";
import { WarningIcon } from "../../common/Icon";
import { useDrawerContext } from "../../common/Layout/Drawer";
import { useNavStack } from "../../common/Layout/NavStack";

export function Logout() {
  const background = useBackgroundClient();
  const nav = useNavStack();
  const user = useUser();

  useEffect(() => {
    nav.setTitle(`Logout ${user.username}`);
  }, []);

  return (
    <Warning
      buttonTitle={"Logout"}
      title={"Logout"}
      subtext={
        "This will remove all the wallets you have created or imported. Make sure you have your existing secret recovery phrase and private keys saved."
      }
      onNext={async () => {
        await background.request({
          method: UI_RPC_METHOD_USER_LOGOUT,
          params: [],
        });
      }}
    />
  );
}

export function ResetWarning() {
  const background = useBackgroundClient();
  const nav = useNavStack();

  useEffect(() => {
    nav.setTitle("Reset Backpack");
  }, []);

  return (
    <Warning
      buttonTitle={"Reset"}
      title={"Reset Backpack"}
      subtext={
        "This will remove all the user accounts you have created or imported. Make sure you have your existing secret recovery phrase and private keys saved."
      }
      onNext={async () => {
        await background.request({
          method: UI_RPC_METHOD_KEYRING_RESET,
          params: [],
        });
      }}
    />
  );
}

function Warning({
  title,
  buttonTitle,
  subtext,
  onNext,
}: {
  title: string;
  buttonTitle: string;
  subtext: string;
  onNext: () => void;
}) {
  const theme = useCustomTheme();
  const { close } = useDrawerContext();

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
        <Header text={title} />
        <SubtextParagraph>{subtext}</SubtextParagraph>
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
              border: `${theme.custom.colors.borderFull}`,
            }}
          />
        </Box>
        <Box sx={{ width: "167.5px" }}>
          <DangerButton label={buttonTitle} onClick={onNext} />
        </Box>
      </Box>
    </Box>
  );
}
