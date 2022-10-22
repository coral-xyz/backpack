export type RpcRequest = {
  id?: number;
  method: string;
  params: any[];
};

export type Event = any;

export interface XnftMetadata {
  isDarkMode: boolean;
  username?: string;
  avatarUrl: string;
}
