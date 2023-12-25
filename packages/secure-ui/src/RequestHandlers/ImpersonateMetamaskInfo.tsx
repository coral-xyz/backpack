import type { QueuedUiRequest } from "../_atoms/requestAtoms";

import { secureUserAtom, userClientAtom } from "@coral-xyz/recoil";
import {
  InfoIcon,
  DangerButton,
  Stack,
  StyledText,
  Switch,
  XStack,
} from "@coral-xyz/tamagui";
import { useRecoilValue } from "recoil";

import { RequestConfirmation } from "../_sharedComponents/RequestConfirmation";

export function ImpersonateMetamaskInfo() {
  const user = useRecoilValue(secureUserAtom);
  const userClient = useRecoilValue(userClientAtom);
  const onApprove = () =>
    userClient.updateUserPreferences({
      uuid: user.user.uuid,
      preferences: {
        confirmedMetaMaskSetting: true,
        doNotImpersonateMetaMask:
          user.preferences.doNotImpersonateMetaMask ?? false,
      },
    });
  return (
    <RequestConfirmation
      onApprove={onApprove}
      rightButton="Okay"
      leftButton={null}
    >
      <Stack>
        <Stack alignItems="center" paddingVertical="$6">
          <InfoIcon size={56} />
        </Stack>
        <Stack padding="$2" space="$2">
          <StyledText fontSize="$2xl" fontWeight="$medium" lineHeight="$2xl">
            Prefer MetaMask?
          </StyledText>
          <StyledText
            fontSize="$md"
            fontWeight="$medium"
            lineHeight="$md"
            color="$baseTextMedEmphasis"
          >
            We are simulating MetaMask to enable you to use Backpack in more
            places.
          </StyledText>
          <XStack
            paddingTop="$6"
            justifyContent="space-between"
            cursor="pointer"
            onPress={async () => {
              await userClient.updateUserPreferences({
                uuid: user.user.uuid,
                preferences: {
                  doNotImpersonateMetaMask:
                    !user.preferences.doNotImpersonateMetaMask,
                },
              });
            }}
          >
            <StyledText>Simulate MetaMask</StyledText>
            <Stack>
              <Switch
                size="$2"
                padding="$1"
                backgroundColor={
                  user.preferences.doNotImpersonateMetaMask
                    ? "$baseTextMedEmphasis"
                    : "$accentBlue"
                }
                checked={!user.preferences.doNotImpersonateMetaMask}
              >
                <Switch.Thumb margin="$-1" animation="quick" />
              </Switch>
            </Stack>
          </XStack>
          <StyledText
            fontSize="$sm"
            fontWeight="$medium"
            lineHeight="$md"
            color="$baseTextMedEmphasis"
          >
            You can change your mind anytime in settings.
          </StyledText>
        </Stack>
      </Stack>
    </RequestConfirmation>
  );
}
