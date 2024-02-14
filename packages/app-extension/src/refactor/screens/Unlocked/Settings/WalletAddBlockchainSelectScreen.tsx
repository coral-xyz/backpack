import type { Blockchain } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { enabledBlockchainConfigsAtom } from "@coral-xyz/recoil";
import { StyledText, YStack } from "@coral-xyz/tamagui";
import { useRecoilValue } from "recoil";

import { NetworkListItem } from "../../../../components/Onboarding/pages/BlockchainSelector";
import { ScreenContainer } from "../../../components/ScreenContainer";
import {
  Routes,
  type SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function WalletAddBlockchainSelectScreen(
  props: SettingsScreenProps<Routes.WalletAddBlockchainSelectScreen>
) {
  return (
    <ScreenContainer loading={<Loading />}>
      <Container {...props} />
    </ScreenContainer>
  );
}

function Loading() {
  return null;
}

function Container({
  navigation,
}: SettingsScreenProps<Routes.WalletAddBlockchainSelectScreen>) {
  const { t } = useTranslation();
  const enabledBlockchainConfigs = useRecoilValue(enabledBlockchainConfigsAtom);

  const onClick = (blockchain: string) => {
    navigation.push(Routes.WalletAddScreen, {
      blockchain: blockchain as Blockchain,
    });
  };

  return (
    <YStack gap={40} paddingHorizontal={16}>
      <YStack gap={16}>
        <StyledText fontSize={24} textAlign="center">
          {t("select_network")}
        </StyledText>
        <StyledText color="$baseTextMedEmphasis" textAlign="center">
          {t("select_network_subtitle")}
        </StyledText>
      </YStack>
      <YStack gap={16}>
        {Object.entries(enabledBlockchainConfigs).map(([blockchain]) => (
          <NetworkListItem
            key={blockchain}
            blockchain={blockchain as Blockchain}
            onClick={() => onClick(blockchain)}
            selectedBlockchains={[]}
          />
        ))}
      </YStack>
    </YStack>
  );
}
