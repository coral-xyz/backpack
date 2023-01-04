import type {
  EnrichedInboxDb,
  EnrichedMessage,
  UserMetadata,
} from "@coral-xyz/common";
import type {} from "@coral-xyz/common/src/messages/fromServer";
import type { Table } from "dexie";
import Dexie from "dexie";

export interface Friend {
  id?: number;
  name: string;
  age: number;
}

export class BackpackDb extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  inbox!: Table<EnrichedInboxDb>;
  messages!: Table<EnrichedMessage>;
  users!: Table<UserMetadata>;

  constructor(uuid) {
    super(`DB_${uuid}`);
    this.version(9).stores({
      inbox:
        "remoteUserId, id, last_message_client_uuid, user1_last_read_message_id, user2_last_read_message_id, blocked, interacted, areFriends, unread",
      messages:
        "client_generated_uuid, room, type, created_at, from_http_server",
      users: "uuid",
    });
  }
}

export const getDb = (uuid: string) => new BackpackDb(uuid);
