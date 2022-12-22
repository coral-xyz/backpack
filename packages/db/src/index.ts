import Dexie from "dexie";
export const db = new Dexie("main");

db.version(1).stores({
  friends:
    "++counterId,store_identifier,id,user1,user2,requested,remote_requested,are_friends,last_message,last_message_timestamp,last_message_sender,user1_blocked_user2,user2_blocked_user1,user1_interacted,user2_interacted,user1_spam_user2,user2_spam_user1,user1_last_read_message_id,user2_last_read_message_id,last_message_client_uuid",
  chats:
    "++counterId,store_identifier,id,message,uuid,room,created_at,client_generated_uuid,type,message_kind,parent_client_generated_uuid",
});

export * from "./api";
