import type {
  CHAT_MESSAGES,
  DELETE_MESSAGE,
  EXECUTE_BARTER,
  MessageWithMetadata,
  NOTIFICATION_ADD,
  UPDATE_ACTIVE_BARTER,
} from "./fromServer";
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
    }
  | {
      type: typeof NOTIFICATION_ADD;
      payload: {
        id: number;
        title: string;
        body: string;
        xnft_id: string;
        timestamp: string;
        uuid: string;
      };
    };
