import { EnrichedInboxDb } from "@coral-xyz/common";

export const MessageList = ({
  activeChats,
}: {
  activeChats: EnrichedInboxDb[];
}) => {
  return <div>{JSON.stringify(activeChats)}</div>;
};
