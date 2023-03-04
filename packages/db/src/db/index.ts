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

export interface LastReceivedUpdateTable {
  last_received_update_id: number;
  last_local_reset_time: number;
  room: string;
}

export interface LocalImageData {
  key: string;
  url: string;
  timestamp: number;
  fullImage: boolean;
}

export class BackpackDb extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  inbox!: Table<EnrichedInboxDb>;
  messages!: Table<EnrichedMessage>;
  users!: Table<UserMetadata>;
  collections!: Table<CollectionChatData>;
  updates!: Table<LastReceivedUpdateTable>;
  localImageData!: Table<LocalImageData>;

  constructor(uuid) {
    super(`DB_${uuid}`);
    this.version(15).stores({
      inbox: "remoteUserId, id, blocked, interacted, areFriends",
      messages: "client_generated_uuid, room, type, from_http_server",
      users: "uuid",
      collections: "collectionId",
      updates: "room",
      localImageData: "key",
    });
  }
}

export const getDb = (uuid: string) => new BackpackDb(uuid);
