import { useEffect } from "react";
import {
  UI_RPC_METHOD_KEYRING_RESET,
  UI_RPC_METHOD_USER_ACCOUNT_LOGOUT,
} from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import {
  DangerButton,
  SecondaryButton,
  WarningIcon,
} from "@coral-xyz/react-common";
import { useBackgroundClient, useUser } from "@coral-xyz/recoil";
import { BpDangerButton, BpSecondaryButton, XStack } from "@coral-xyz/tamagui";
import { Box } from "@mui/material";

import { Header, HeaderIcon, SubtextParagraph } from "../../common";
import { useDrawerContext } from "../../common/Layout/Drawer";
import { useNavigation } from "../../common/Layout/NavStack";

export function Logout() {
  const { close } = useDrawerContext();
  const nav = useNavigation();
  const user = useUser();
  const background = useBackgroundClient();
  const { t } = useTranslation();

  useEffect(() => {
    nav.setOptions({ headerTitle: `Remove ${user.username}` });
  }, []);

  return (
    <Warning
      buttonTitle={t("remove")}
      title={t("remove_user.title")}
      subtext={t("remove_user.subtitle")}
      onNext={async () => {
        // ph101pp todo
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
  const { t } = useTranslation();

  useEffect(() => {
    nav.setOptions({ headerTitle: "Reset Backpack" });
  }, []);

  return (
    <Warning
      buttonTitle={t("reset")}
      title={t("reset_backpack")}
      subtext={t("reset_backpack_subtitle")}
      onNext={async () => {
        // ph101pp todo
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
  const { close } = useDrawerContext();
  const { t } = useTranslation();

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
      <XStack padding="$4" space="$4">
        <BpSecondaryButton label={t("cancel")} onPress={() => close()} />
        <BpDangerButton label={buttonTitle} onPress={() => onNext()} />
      </XStack>
    </Box>
  );
}
