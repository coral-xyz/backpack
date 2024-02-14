import { useTranslation } from "@coral-xyz/i18n";
import { CheckIcon } from "@coral-xyz/react-common";
import {
  BpPrimaryButton,
  StyledText,
  useTheme,
  YStack,
} from "@coral-xyz/tamagui";

import { ScreenContainer } from "../../../../../refactor/components/ScreenContainer";

export function WalletRemoveConfirmationScreen(props: any) {
  return (
    <ScreenContainer loading={<Loading />}>
      <Container {...props} />
    </ScreenContainer>
  );
}

function Loading() {
  return null;
}

function Container({ navigation }: any) {
  const { t } = useTranslation();
  const theme = useTheme();

  const onDone = () => {
    navigation.popToTop();
  };

  return (
    <YStack ai="center" f={1} p={16} justifyContent="space-between">
      <YStack ai="center" gap={24} width="100%" mt={80}>
        <CheckIcon />
        <StyledText
          fontSize={24}
          color={theme.baseTextHighEmphasis.val}
          textAlign="center"
        >
          {t("wallet_removed")}
        </StyledText>
      </YStack>
      <YStack ai="center" width="100%">
        <BpPrimaryButton
          onPress={() => {
            onDone();
          }}
          label={t("done")}
        />
      </YStack>
    </YStack>
  );
}
