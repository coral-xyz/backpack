import type { QueuedUiRequest } from "../_atoms/requestAtoms";

import { Blockchain } from "@coral-xyz/common";
import { StyledText, TextArea, YStack } from "@coral-xyz/tamagui";

import { OriginUserHeader } from "./OriginHeader";
import { RequestConfirmation } from "./RequestConfirmation";

export function ApproveMessage(props: {
  currentRequest:
    | QueuedUiRequest<"SECURE_EVM_SIGN_MESSAGE">
    | QueuedUiRequest<"SECURE_SVM_SIGN_MESSAGE">;
  blockchain: Blockchain;
  title: string;
  message: string;
}) {
  const onApprove = () => props.currentRequest.respond({ confirmed: true });
  const onDeny = () => props.currentRequest.error(new Error("Approval Denied"));

  const firstByte = new Uint8Array([255]);
  const domain8Bit = Uint8Array.from("solana offchain", (x) => x.charCodeAt(0));
  const solanaOffchainHeaderStart = Buffer.from(
    new Uint8Array([...firstByte, ...domain8Bit])
  ).toString();

  // if message starts with solana offchain header -> remove.
  const message = props.message.startsWith(solanaOffchainHeaderStart)
    ? props.message.slice(20)
    : props.message;

  return (
    <RequestConfirmation
      title="Sign Message"
      onApprove={onApprove}
      onDeny={onDeny}
    >
      <YStack space="$4">
        <OriginUserHeader
          origin={props.currentRequest.event.origin}
          publicKey={props.currentRequest.request.publicKey}
          blockchain={props.blockchain}
        />
        <YStack space="$2">
          <StyledText fontSize="$sm" color="$baseTextMedEmphasis">
            Message:
          </StyledText>
          <StyledText
            borderColor="$baseBorderMed"
            borderWidth={2}
            borderRadius="$4"
            bg="$baseBackgroundL1"
            padding="$4"
            whiteSpace="pre-wrap"
          >
            {message}
          </StyledText>
        </YStack>
      </YStack>
    </RequestConfirmation>
  );
}
