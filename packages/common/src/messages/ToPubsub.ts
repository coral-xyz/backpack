import type {
  CHAT_MESSAGES,
 DELETE_MESSAGE,  EXECUTE_BARTER,
  MessageWithMetadata,
  UPDATE_ACTIVE_BARTER } from "./fromServer";
import type { BarterOffers } from "./index";

export type ToPubsub =
  | {
      type: typeof CHAT_MESSAGES;
      payload: { messages: MessageWithMetadata[] };
    }
  | {
      type: typeof UPDATE_ACTIVE_BARTER;
      payload: {
        barterId: number;
        localOffers?: BarterOffers;
        remoteOffers?: BarterOffers;
      };
    }
  | {
      type: typeof DELETE_MESSAGE;
      payload: {
        client_generated_uuid: string;
      };
    }
  | {
      type: typeof EXECUTE_BARTER;
      payload: {
        barterId: number;
      };
    };
