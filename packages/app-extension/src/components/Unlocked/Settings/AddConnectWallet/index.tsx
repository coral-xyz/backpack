import { type ReactNode, useState } from "react";
import {
  type Blockchain,
  formatTitleCase,
  formatWalletAddress,
  openConnectHardware,
} from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import {
  BackpackMnemonicIcon,
  HardwareIcon,
  Loading,
  MnemonicIcon,
  PlusCircleIcon,
  SecretKeyIcon,
} from "@coral-xyz/react-common";
import {
  secureUserAtom,
  useCreateNewWallet,
  useKeyringHasMnemonic,
} from "@coral-xyz/recoil";
import {
  BpPrimaryButton,
  StyledText,
  useTheme,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";
import { useNavigation } from "@react-navigation/native";
import { useRecoilValue } from "recoil";

import { Routes } from "../../../../refactor/navigation/SettingsNavigator";
import { WithMiniDrawer } from "../../../common/Layout/Drawer";
import { _IncognitoAvatarFromUsername } from "../AvatarPopover";

export function AddWalletMenu({ blockchain }: { blockchain: Blockchain }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const hasMnemonic = useKeyringHasMnemonic();
  const user = useRecoilValue(secureUserAtom);
  const { createNewWithPhrase } = useCreateNewWallet(blockchain);
  const [newPublicKey, setNewPublicKey] = useState("");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [loading, setLoading] = useState(false);

  const keyringExists = !!user.publicKeys.platforms[blockchain];

  const close = () => {
    navigation.popToTop();
    navigation.popToTop();
  };

  const handlePressCreateNew = async () => {
    setLoading(true);
    setOpenDrawer(true);
    createNewWithPhrase()
      .then(({ publicKey }) => {
        setNewPublicKey(publicKey);
      })
      .catch((e) => {
        console.error(e);
        setOpenDrawer(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <YStack gap={32} paddingHorizontal={16}>
        <YStack alignItems="center" gap={16}>
          <_IncognitoAvatarFromUsername
            index={0}
            username={user.user.username}
            variant="lg"
          />
          <StyledText fontSize={24} textAlign="center">
            {user.user.username}
          </StyledText>
          <StyledText color="$baseTextMedEmphasis" textAlign="center">
            {t("add_wallet_for_blockchain", {
              blockchain: formatTitleCase(blockchain),
            })}
          </StyledText>
        </YStack>
        <YStack gap={12}>
          {hasMnemonic ? (
            <_ImportMenuOptionCard
              icon={<PlusCircleIcon fill={theme.baseIcon.val} />}
              title={t("create_new_wallet")}
              onClick={handlePressCreateNew}
            />
          ) : (
            <_ImportMenuOptionCard
              icon={<PlusCircleIcon fill={theme.baseIcon.val} />}
              title={t("setup_recovery_phrase")}
              onClick={() =>
                navigation.push(Routes.WalletCreateOrImportMnemonicScreen, {
                  blockchain,
                  keyringExists,
                })
              }
            />
          )}
          {hasMnemonic ? (
            <_ImportMenuOptionCard
              icon={
                <BackpackMnemonicIcon style={{}} fill={theme.baseIcon.val} />
              }
              title={t("backpack_recovery_phrase")}
              onClick={() =>
                navigation.push(Routes.WalletAddBackpackRecoveryPhraseScreen, {
                  blockchain,
                })
              }
            />
          ) : null}
          {/* <_ImportMenuOptionCard
            icon={<MnemonicIcon style={{}} fill={theme.baseIcon.val} />}
            title={t("other_recovery_phrase")}
            onClick={() =>
              navigation.push(Routes.WalletAddDeriveRecoveryPhraseScreen, {
                blockchain,
              })
            }
          /> */}
          <_ImportMenuOptionCard
            icon={<SecretKeyIcon fill={theme.baseIcon.val} />}
            title={t("private_key")}
            onClick={() =>
              navigation.push(Routes.WalletAddPrivateKeyScreen, {
                blockchain,
              })
            }
          />
          <_ImportMenuOptionCard
            icon={<HardwareIcon fill={theme.baseIcon.val} />}
            title={t("hardware_wallet")}
            onClick={() =>
              navigation.push(Routes.WalletAddHardwareScreen, {
                blockchain,
              })
            }
          />
          {/* <_ImportMenuOptionCard
            icon={<HardwareIcon fill={theme.baseIcon.val} />}
            title={t("hardware_wallet")}
            onClick={() => {
              navigation.popToTop();
              navigation.popToTop();
              openConnectHardware();
            }}
          /> */}
        </YStack>
      </YStack>
      <WithMiniDrawer
        openDrawer={openDrawer}
        setOpenDrawer={(open: boolean) => {
          setOpenDrawer(open);
          if (!open) {
            close();
          }
        }}
      >
        {newPublicKey ? (
          <ConfirmCreateWallet
            isLoading={loading}
            publicKey={newPublicKey}
            onClose={() => {
              setOpenDrawer(false);
              close();
            }}
          />
        ) : null}
      </WithMiniDrawer>
    </>
  );
}

export function _ImportMenuOptionCard({
  icon,
  onClick,
  title,
}: {
  icon: ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <XStack
      backgroundColor="$baseBackgroundL1"
      borderRadius={12}
      cursor="pointer"
      gap={8}
      hoverStyle={{ opacity: 0.8 }}
      onPress={onClick}
      paddingHorizontal={16}
      paddingVertical={20}
    >
      {icon}
      <StyledText>{title}</StyledText>
    </XStack>
  );
}

export function ConfirmCreateWallet({
  isLoading,
  publicKey,
  onClose,
}: {
  isLoading?: boolean;
  publicKey: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <YStack alignItems="center" gap={24} minHeight={230} padding={24}>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <XStack
            alignItems="center"
            backgroundColor="$greenBackgroundTransparent"
            borderRadius="$circular"
            padding={20}
          >
            <_CheckIcon />
          </XStack>
          <YStack gap={16}>
            <StyledText fontSize={24} textAlign="center">
              {t("wallet_created")}
            </StyledText>
            <StyledText
              color="$baseTextMedEmphasis"
              fontSize={18}
              textAlign="center"
            >
              {formatWalletAddress(publicKey)}
            </StyledText>
          </YStack>
          <YStack width="100%">
            <BpPrimaryButton label={t("view_balances")} onPress={onClose} />
          </YStack>
        </>
      )}
    </YStack>
  );
}

const _CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
  >
    <path
      d="M26.6666 8L11.9999 22.6667L5.33325 16"
      stroke="#00C278"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
