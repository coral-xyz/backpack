import type { QueuedUiRequest } from "../_atoms/requestAtoms";

import {
  AlertOctagonIcon,
  DangerButton,
  Stack,
  StyledText,
} from "@coral-xyz/tamagui";

import { RequestConfirmation } from "../_sharedComponents/RequestConfirmation";

export function ResetBackpackRequest({
  currentRequest,
}: {
  currentRequest: QueuedUiRequest<"SECURE_USER_RESET_BACKPACK">;
}) {
  const onApprove = () =>
    currentRequest.respond({
      confirmed: true,
    });

  const onDeny = () => currentRequest.error(new Error("Approval Denied"));

  return (
    <RequestConfirmation
      onDeny={onDeny}
      rightButton={<DangerButton label="Approve" onPress={onApprove} />}
    >
      <Stack>
        <Stack alignItems="center" paddingVertical="$6">
          <AlertOctagonIcon color="$baseIcon" size={56} />
        </Stack>
        <Stack padding="$2" space="$2">
          <StyledText fontSize="$2xl" fontWeight="$medium" lineHeight="$2xl">
            Reset Backpack?
          </StyledText>
          <StyledText
            fontSize="$md"
            fontWeight="$medium"
            lineHeight="$md"
            color="$baseTextMedEmphasis"
          >
            This will remove all the user accounts you have created or imported.
            Make sure you have your existing secret recovery phrase and private
            keys saved.{" "}
          </StyledText>
        </Stack>
      </Stack>
    </RequestConfirmation>
  );
}
