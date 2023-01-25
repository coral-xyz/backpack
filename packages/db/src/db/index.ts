import type {
  CollectionChatData,
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
  collections!: Table<CollectionChatData>;

  constructor(uuid) {
    super(`DB_${uuid}`);
    this.version(12).stores({
      inbox: "remoteUserId, id, blocked, interacted, areFriends",
      messages: "client_generated_uuid, room, type, from_http_server",
      users: "uuid",
      collections: "collectionId",
    });
  }
}

export const getDb = (uuid: string) => new BackpackDb(uuid);
