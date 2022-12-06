export interface InboxDb {
  last_message?: string;
  last_message_timestamp?: string;
  last_message_sender?: string;
  user1: string;
  user2: string;
  are_friends: boolean;
}

export interface EnrichedInboxDb extends InboxDb {
  remoteUsername: string;
  remoteUserImage: string;
  remoteUserId: string;
}

export interface Friendship {
  id: string;
  areFriends: boolean;
  blocked: boolean;
  requested: boolean;
  spam: boolean;
}
