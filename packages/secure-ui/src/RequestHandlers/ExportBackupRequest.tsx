import type { QueuedUiRequest } from "../_atoms/requestAtoms";

import { useState } from "react";
import { ImageBackground } from "react-native";

// import { UI_RPC_METHOD_KEYRING_STORE_UNLOCK } from "@coral-xyz/common";
import {
  _secureOnboardedUserAtom,
  isLockAvatarFullScreen,
  useAvatarUrl,
  userClientAtom,
} from "@coral-xyz/recoil";
import { safeClientResponse } from "@coral-xyz/secure-clients";
import {
  AlignJustifyIcon,
  BanIcon,
  Button,
  ChevronRightIcon,
  CustomScrollView,
  DangerButton,
  Form,
  CopyIcon,
  TextArea,
  Stack,
  SecondaryButton,
  StyledText,
  Text,
  EyeIcon,
  AlertTriangleIcon,
  XStack,
  useTheme,
  YStack,
  PrimaryButton,
  CheckIcon,
} from "@coral-xyz/tamagui";

export function ExportBackupRequest({
  currentRequest,
}: {
  currentRequest: QueuedUiRequest<"SECURE_USER_EXPORT_BACKUP">;
}) {
  return (
    <ShowBackup
      mnemonic={currentRequest.uiOptions.backup}
      currentRequest={currentRequest}
    />
  );
}

function ShowBackup({
  currentRequest,
  mnemonic,
}: {
  currentRequest: QueuedUiRequest<"SECURE_USER_EXPORT_BACKUP">;
  mnemonic: string;
}) {
  const [copied, setCopied] = useState<boolean>(false);
  return (
    <YStack height="100%" justifyContent="space-between">
      <YStack space="$2" marginTop="$6" marginHorizontal="$4">
        <XStack justifyContent="center" alignItems="center">
          <EyeIcon size="$5xl" />
        </XStack>
        <StyledText textAlign="center" fontSize="$2xl">
          Your Backpack Backup
        </StyledText>
        <StyledText textAlign="center">
          contains your encrypted private keys. Do not share it. Reach out to
          Backpack support for help.
        </StyledText>
      </YStack>
      <YStack marginLeft="$4" marginRight="$4" marginBottom="$4">
        <TextArea
          borderColor="$baseBorderMed"
          borderWidth={2}
          bg="$baseBackgroundL1"
          height={128}
          value={mnemonic}
          disabled
          marginBottom="$4"
        />
        <PrimaryButton
          label="Copy"
          icon={
            copied ? (
              <CheckIcon
                size="$md"
                style={{ marginLeft: 8 }}
                color="$buttonPrimaryText"
              />
            ) : (
              <CopyIcon
                size="$md"
                style={{ marginLeft: 8 }}
                color="$buttonPrimaryText"
              />
            )
          }
          onPress={async () => {
            setCopied(false);
            await navigator.clipboard.writeText(mnemonic);
            setCopied(true);
          }}
        />
      </YStack>
      <YStack marginLeft="$4" marginRight="$4" marginBottom="$4">
        <SecondaryButton
          label="Close"
          onPress={() => currentRequest.respond()}
        />
      </YStack>
    </YStack>
  );
}
