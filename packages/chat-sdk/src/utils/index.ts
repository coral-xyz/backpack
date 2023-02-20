import type { EnrichedMessage } from "@coral-xyz/common";

export const merge = (
  originalMessages: EnrichedMessage[],
  incomingMessages: EnrichedMessage[]
) => {
  const mergedMessages: EnrichedMessage[] = [];
  let firstPtr = 0,
    secondPtr = 0;
  const messageCache: { [key: string]: boolean } = {};
  while (
    firstPtr < originalMessages.length ||
    secondPtr < incomingMessages.length
  ) {
    const firstEl = originalMessages[firstPtr];
    const secondEl = incomingMessages[secondPtr];

    if (!firstEl) {
      if (!messageCache[secondEl.client_generated_uuid || ""]) {
        mergedMessages.push(secondEl);
        messageCache[secondEl.client_generated_uuid || ""] = true;
      }
      secondPtr++;
      continue;
    }

    if (!secondEl) {
      if (!messageCache[firstEl.client_generated_uuid || ""]) {
        mergedMessages.push(firstEl);
        messageCache[firstEl.client_generated_uuid || ""] = true;
      }
      firstPtr++;
      continue;
    }

    if (
      new Date(firstEl.created_at).getTime() <
      new Date(secondEl.created_at).getTime()
    ) {
      if (!messageCache[firstEl.client_generated_uuid || ""]) {
        mergedMessages.push(firstEl);
        messageCache[firstEl.client_generated_uuid || ""] = true;
      }
      firstPtr++;
      continue;
    } else {
      if (!messageCache[secondEl.client_generated_uuid || ""]) {
        mergedMessages.push(secondEl);
        messageCache[secondEl.client_generated_uuid || ""] = true;
      }
      secondPtr++;
      continue;
    }
  }
  return mergedMessages;
};
