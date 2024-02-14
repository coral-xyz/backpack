import { useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { ImportedIcon, MnemonicIcon } from "@coral-xyz/react-common";
import { useCreateNewWallet } from "@coral-xyz/recoil";
import { StyledText, useTheme, YStack } from "@coral-xyz/tamagui";
import { useNavigation } from "@react-navigation/native";

import { Routes } from "../../../../refactor/navigation/SettingsNavigator";
import { MnemonicInput } from "../../../common/Account/MnemonicInput";
import { WithMiniDrawer } from "../../../common/Layout/Drawer";

import { _ImportMenuOptionCard, ConfirmCreateWallet } from "./";

export function CreateOrImportMnemonic({
  blockchain,
}: {
  blockchain: Blockchain;
}) {
  const navigation = useNavigation<any>();
  const theme = useTheme();

  return (
    <YStack gap={32} paddingHorizontal={16}>
      <YStack gap={16}>
        <StyledText fontSize={24} textAlign="center">
          Setup your Backpack Secret Recovery Phrase
        </StyledText>
        <StyledText color="$baseTextMedEmphasis" textAlign="center">
          Create or import a secret recovery phrase. This will be used to create
          new wallets, so make sure you don't lose it. Only you will have access
          to this secret.
        </StyledText>
      </YStack>
      <YStack gap={12}>
        <_ImportMenuOptionCard
          icon={<MnemonicIcon style={{}} fill={theme.baseIcon.val} />}
          title="Generate new phrase"
          onClick={() =>
            navigation.push(Routes.WalletCreateMnemonicScreen, {
              blockchain,
            })
          }
        />
        <_ImportMenuOptionCard
          icon={<ImportedIcon style={{}} fill={theme.baseIcon.val} />}
          title="Import recovery phrase"
          onClick={() =>
            navigation.push(Routes.WalletSetMnemonicScreen, {
              blockchain,
            })
          }
        />
      </YStack>
    </YStack>
  );
}

export function CreateMnemonic({ blockchain }: { blockchain: Blockchain }) {
  const { t } = useTranslation();
  const { createNewWithPhrase } = useCreateNewWallet(blockchain);
  const navigation = useNavigation<any>();

  const [openDrawer, setOpenDrawer] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  // TODO replace the left nav button to go to the previous step if step > 0

  const closeParentDrawer = () => {
    navigation.popToTop();
    navigation.popToTop();
  };

  const onComplete = async (mnemonic: string) => {
    try {
      const { publicKey } = await createNewWithPhrase(mnemonic);
      setPublicKey(publicKey);
      setOpenDrawer(true);
    } catch (e) {
      console.error(e);
      closeParentDrawer();
    }
  };

  return (
    <>
      <MnemonicInput
        readOnly
        fullscreen={false}
        buttonLabel={t("next")}
        subtitle="Write it down and store it in a safe place."
        onNext={async (mnemonic: string) => {
          await onComplete(mnemonic);
        }}
      />
      <WithMiniDrawer
        openDrawer={openDrawer}
        setOpenDrawer={(open: boolean) => {
          // Must close parent when the confirm create wallet drawer closes because
          // the next button in the mnemonic input screen is no longer valid as the users
          // keyring has a mnemonic once it has been clicked once
          if (!open) closeParentDrawer();
          setOpenDrawer(open);
        }}
      >
        <ConfirmCreateWallet
          publicKey={publicKey!}
          onClose={() => {
            setOpenDrawer(false);
            closeParentDrawer();
          }}
        />
      </WithMiniDrawer>
    </>
  );
}
