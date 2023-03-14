import { useEffect } from "react";
import {
  UI_RPC_METHOD_KEYRING_RESET,
  UI_RPC_METHOD_USER_ACCOUNT_LOGOUT,
} from "@coral-xyz/common";
import {
  DangerButton,
  SecondaryButton,
  WarningIcon,
} from "@coral-xyz/react-common";
import { useBackgroundClient, useUser } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Box } from "@mui/material";

import { Header, HeaderIcon, SubtextParagraph } from "../../common";
import { useDrawerContext } from "../../common/Layout/Drawer";
import { useNavigation } from "../../common/Layout/NavStack";

export function Logout() {
  const background = useBackgroundClient();
  const nav = useNavigation();
  const user = useUser();
  const { close } = useDrawerContext();

  useEffect(() => {
    nav.setOptions({ headerTitle: `Log out ${user.username}` });
  }, []);

  return (
    <Warning
      buttonTitle="Log out"
      title="Log out"
      subtext="This will remove all the wallets you have created or imported. Make sure you have your existing secret recovery phrase and private keys saved."
      onNext={async () => {
        await background.request({
          method: UI_RPC_METHOD_USER_ACCOUNT_LOGOUT,
          params: [user.uuid],
        });
        setTimeout(close, 250);
      }}
    />
  );
}

export function ResetWarning() {
  const background = useBackgroundClient();
  const nav = useNavigation();

  useEffect(() => {
    nav.setOptions({ headerTitle: "Reset Backpack" });
  }, []);

  return (
    <Warning
      buttonTitle="Reset"
      title="Reset Backpack"
      subtext="This will remove all the user accounts you have created or imported. Make sure you have your existing secret recovery phrase and private keys saved."
      onNext={async () => {
        await background.request({
          method: UI_RPC_METHOD_KEYRING_RESET,
          params: [],
        });
        window.close();
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
        <SecondaryButton
          label="Cancel"
          onClick={close}
          style={{
            marginRight: "8px",
            border: `${theme.custom.colors.borderFull}`,
          }}
        />
        <DangerButton label={buttonTitle} onClick={onNext} />
      </Box>
    </Box>
  );
}
