import { useState } from "react";
import { useTranslation } from "@coral-xyz/i18n";
import {
  BpInputInner,
  BpLinkButton,
  BpPrimaryButton,
  StyledText,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";

import { _IncognitoAvatarFromUsername } from "../../Unlocked/Settings/AvatarPopover";

export function AccountName({ onNext }: { onNext: (val?: string) => void }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");

  return (
    <YStack f={1} gap={40} width="100%">
      <XStack justifyContent="center">
        <_IncognitoAvatarFromUsername
          index={0}
          username={name || "Account 1"}
          variant="lg"
        />
      </XStack>
      <YStack gap={16}>
        <StyledText fontSize={36} fontWeight="$semiBold" textAlign="center">
          {t("new_account_name.title")}
        </StyledText>
        <StyledText color="$baseTextMedEmphasis" textAlign="center">
          {t("new_account_name.subtitle")}
        </StyledText>
      </YStack>
      <BpInputInner
        paddingVertical={24}
        placeholder={t("account_name")}
        value={name}
        onChangeText={setName}
        wrapperProps={{ flex: 1, justifyContent: "flex-start" }}
      />
      <YStack maxWidth={420}>
        <BpPrimaryButton
          disabled={name === ""}
          label={t("next")}
          onPress={() => onNext(name)}
        />
        <BpLinkButton
          label={t("skip")}
          labelProps={{ color: "$baseTextMedEmphasis" }}
          onPress={() => onNext()}
        />
      </YStack>
    </YStack>
  );
}
