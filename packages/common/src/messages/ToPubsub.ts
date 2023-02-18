import type {
  CHAT_MESSAGES,
  MessageWithMetadata,
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
    };
