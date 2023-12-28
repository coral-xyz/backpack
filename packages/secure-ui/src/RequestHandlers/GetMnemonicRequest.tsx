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
  CustomScrollView,
  Form,
  CopyIcon,
  TextArea,
  Stack,
  StyledText,
  Text,
  EyeIcon,
  AlertTriangleIcon,
  XStack,
  useTheme,
  YStack,
  CheckIcon,
  BpDangerButton,
  BpPasswordInput,
  BpPrimaryButton,
  BpSecondaryButton,
} from "@coral-xyz/tamagui";
import { useRecoilValue } from "recoil";

import { PasswordInput } from "../RequireUserUnlocked/PasswordInput";
import { RequestConfirmation } from "../_sharedComponents/RequestConfirmation";

export function GetMnemonicRequest({
  currentRequest,
}: {
  currentRequest: QueuedUiRequest<"SECURE_USER_GET_MNEMONIC">;
}) {
  if (currentRequest.uiOptions.backup) {
    return (
      <ShowMnemonic
        backup={currentRequest.uiOptions.backup}
        currentRequest={currentRequest}
      />
    );
  }
  return <WarningPasswordGate currentRequest={currentRequest} />;
}

function WarningPasswordGate({
  currentRequest,
}: {
  currentRequest: QueuedUiRequest<"SECURE_USER_GET_MNEMONIC">;
}) {
  const currentUser = useRecoilValue(_secureOnboardedUserAtom);
  const userClient = useRecoilValue(userClientAtom);
  const [hasError, setHasError] = useState(false);
  const [password, setPassword] = useState<string>("");
  const theme = useTheme();
  const avatarUrl = useAvatarUrl(120, currentUser.user.username);
  const isFullScreenLockAvatar = useRecoilValue(isLockAvatarFullScreen);

  const onChange = (password: string) => {
    setPassword(password);
  };

  const onSubmit = async () => {
    safeClientResponse(
      userClient.checkPassword({
        password,
      })
    )
      .then((unlockResponse) => {
        currentRequest.respond({ password });
      })
      .catch((e) => {
        setHasError(true);
      });
  };

  return (
    <ImageBackground
      style={{
        height: "100%",
        width: "100%",
        position: "relative",
        backgroundColor: theme.baseBackgroundL0.val,
      }}
      source={{ uri: isFullScreenLockAvatar ? avatarUrl : undefined }}
      resizeMode="cover"
    >
      <Stack
        style={{
          position: "relative",
          height: "100%",
          width: "100%",
          backgroundColor: theme.baseBackgroundL0.val,
        }}
      >
        <CustomScrollView
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
          }}
        >
          <Stack
            position="relative"
            height="100%"
            width="100%"
            flex={1}
            alignSelf="center"
            justifyContent="center"
            space="$2"
          >
            <Stack space="$2" alignItems="center">
              <XStack
                borderRadius="$medium"
                borderWidth="$1"
                overflow="hidden"
                marginHorizontal="$3"
                borderColor="transparent"
                backgroundColor="$baseBackgroundL1"
                key="1"
                alignItems="flex-start"
                justifyContent="flex-start"
                cursor="pointer"
                gap="$3"
                padding="$2.5"
                paddingLeft="$3"
              >
                <Stack
                  height="$2"
                  width="$2"
                  justifyContent="center"
                  alignItems="center"
                >
                  <AlertTriangleIcon color="$redIcon" size="$1xl" />
                </Stack>
                <Text flexGrow={1} fontSize="$base" fontWeight="$medium">
                  Backpack support will never ask for your secret phrase.
                </Text>
              </XStack>
              <XStack
                borderRadius="$medium"
                // marginVertical="$4"
                marginHorizontal="$3"
                borderWidth="$1"
                overflow="hidden"
                borderColor="transparent"
                backgroundColor="$baseBackgroundL1"
                key="2"
                alignItems="flex-start"
                justifyContent="flex-start"
                cursor="pointer"
                gap="$3"
                padding="$2.5"
                paddingLeft="$3"
              >
                <Stack
                  height="$2"
                  width="$2"
                  justifyContent="center"
                  alignItems="center"
                >
                  <AlertTriangleIcon color="$redIcon" size="$1xl" />
                </Stack>
                <Text flexGrow={1} fontSize="$base" fontWeight="$medium">
                  Never share your secret phrase or enter it into an app or
                  website.
                </Text>
              </XStack>
              <XStack
                borderRadius="$medium"
                marginHorizontal="$3"
                borderWidth="$1"
                overflow="hidden"
                borderColor="transparent"
                backgroundColor="$baseBackgroundL1"
                key="3"
                alignItems="flex-start"
                justifyContent="flex-start"
                cursor="pointer"
                gap="$4"
                padding="$2.5"
                paddingLeft="$3"
              >
                <Stack
                  height="$2"
                  width="$2"
                  justifyContent="center"
                  alignItems="center"
                >
                  <AlertTriangleIcon color="$redIcon" size="$1xl" />
                </Stack>
                <Text flexGrow={1} fontSize="$base" fontWeight="$medium">
                  Anyone with your secret phrase will have complete control of
                  your account.
                </Text>
              </XStack>
            </Stack>
            <Stack marginHorizontal="$3" marginTop="$4" zIndex={1}>
              <Form onSubmit={onSubmit}>
                <BpPasswordInput
                  onChangeText={onChange}
                  onSubmitEditing={onSubmit}
                />
                <Stack marginTop="$4">
                  <BpDangerButton
                    disabled={password === ""}
                    label="Show secrets"
                    onPress={onSubmit}
                  />
                </Stack>
              </Form>
            </Stack>
          </Stack>
        </CustomScrollView>
      </Stack>
    </ImageBackground>
  );
}

function ShowMnemonic({
  currentRequest,
  backup,
}: {
  currentRequest: QueuedUiRequest<"SECURE_USER_GET_MNEMONIC">;
  backup: string;
}) {
  const [copied, setCopied] = useState<boolean>(false);
  return (
    <YStack
      height="100%"
      justifyContent="space-between"
      space="$4"
      padding="$4"
    >
      <YStack space="$2" marginTop="$6">
        <XStack justifyContent="center" alignItems="center">
          <EyeIcon size="$5xl" />
        </XStack>
        <StyledText textAlign="center" fontSize="$2xl">
          Your Backpack Backup
        </StyledText>
        <StyledText textAlign="center">
          Contains all your mnemonics and private keys currently stored in
          Backpack.
        </StyledText>
      </YStack>
      <YStack flex={1}>
        <TextArea
          borderColor="$baseBorderMed"
          borderWidth={2}
          bg="$baseBackgroundL1"
          flex={1}
          value={backup}
          disabled
        />
      </YStack>
      <YStack space="$4">
        <BpPrimaryButton
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
            await navigator.clipboard.writeText(backup);
            setCopied(true);
          }}
        />
        <BpSecondaryButton
          label="Close"
          onPress={() => currentRequest.respond({ password: false })}
        />
      </YStack>
    </YStack>
  );
}
