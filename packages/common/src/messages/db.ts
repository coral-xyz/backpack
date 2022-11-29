export interface InboxDb {
  last_message?: string;
  last_message_timestamp?: string;
  last_message_sender?: string;
  user1: string;
  user2: string;
  are_friends: boolean;
}

export interface EnrichedInboxDb {
  last_message: string;
  last_message_timestamp: string;
  last_message_sender: string;
  user1: string;
  user2: string;
  user1Username: string;
  user2Username: string;
  user1Image: string;
  user2Image: string;
}
