import { WarningIcon } from "@coral-xyz/react-common";
import { secureUserAtom, useBackgroundClient, userClientAtom, useUser } from "@coral-xyz/recoil";
import { BpDangerButton, BpSecondaryButton, YStack } from "@coral-xyz/tamagui";
import { Box } from "@mui/material";
import { useNavigation } from "@react-navigation/native";
import { useRecoilValue } from "recoil";

import { useTranslation } from "../../../../../../i18n/src";
import {
  Header,
  HeaderIcon,
  SubtextParagraph,
} from "../../../../components/common";
import { ScreenContainer } from "../../../components/ScreenContainer";
import { useNavigationPersistence } from "../../../hooks/useNavigationPersistence";
import type {
  Routes,
  SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function YourAccountRemoveScreen(
  props: SettingsScreenProps<Routes.YourAccountRemoveScreen>
) {
  return (
    <ScreenContainer loading={<Loading />}>
      <Container {...props} />
    </ScreenContainer>
  );
}

function Loading() {
  // TODO.
  return null;
}

function Container(
  _props: SettingsScreenProps<Routes.YourAccountRemoveScreen>
) {
  return <Logout />;
}

function Logout() {
  const navigation = useNavigation<any>();
  const user = useUser();
  const background = useBackgroundClient();
  const { t } = useTranslation();
  const { reset } = useNavigationPersistence();
  const userClient = useRecoilValue(userClientAtom);

  const close = () => {
    navigation.popToTop();
    navigation.popToTop();
  };

  return (
    <Warning
      buttonTitle={t("remove")}
      title={t("remove_user.title")}
      subtext={t("remove_user.subtitle")}
      onNext={async () => {
        reset();
        await userClient.removeUser({
          uuid: user.uuid
        })
        setTimeout(close, 250);
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
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const close = () => {
    navigation.popToTop();
    navigation.popToTop();
  };
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
      <YStack padding="$4" space="$3">
        <BpDangerButton label={buttonTitle} onPress={() => onNext()} />
        <BpSecondaryButton label={t("cancel")} onPress={() => close()} />
      </YStack>
    </Box>
  );
}
