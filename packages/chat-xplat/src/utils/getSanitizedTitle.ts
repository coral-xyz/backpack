import type { MessageKind } from "@coral-xyz/common";
import { MessageWithMetadata } from "@coral-xyz/common";

export const getSanitizedTitle = (message: {
  message: string;
  message_kind: MessageKind;
}) => {
  return message.message_kind === "gif"
    ? "GIF"
    : message.message_kind === "secure-transfer"
    ? "Secure Transfer"
    : message.message_kind === "media"
    ? "Media"
    : message.message;
};
