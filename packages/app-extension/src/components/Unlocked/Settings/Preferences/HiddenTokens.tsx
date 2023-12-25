import { useEffect } from "react";
import { useTranslation } from "@coral-xyz/i18n";
import { useActiveWallet } from "@coral-xyz/recoil";
import { StyledText, YStack } from "@coral-xyz/tamagui";

import { useNavigation } from "../../../common/Layout/NavStack";
import { HiddenTokensList } from "../../TokenBalances/TokenDisplayManagementDrawer";

export function PreferencesHiddenTokens() {
  const nav = useNavigation();
  const { t } = useTranslation();
  const { publicKey, blockchain } = useActiveWallet();

  useEffect(() => {
    nav.setOptions({ headerTitle: t("hidden_tokens") });
  }, [nav, t]);

  return (
    <YStack
      ai="center"
      gap={36}
      maxHeight={550}
      minHeight={450}
      paddingTop={36}
      paddingHorizontal={12}
    >
      <StyledText
        color="$baseTextMedEmphasis"
        fontSize="$sm"
        textAlign="center"
        paddingHorizontal={12}
      >
        {t("hidden_tokens_description")}
      </StyledText>
      <HiddenTokensList address={publicKey} blockchain={blockchain} />
    </YStack>
  );
}
