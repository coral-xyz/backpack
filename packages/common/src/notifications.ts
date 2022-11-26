export interface EnrichedNotification extends DbNotification {
  xnftImage: string;
  xnftTitle: string;
}

export interface DbNotification {
  title: string;
  body: string;
  xnftId: string;
  timestamp: number;
}
