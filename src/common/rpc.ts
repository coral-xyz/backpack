export type RpcRequest = {
  id: number;
  method: string;
  params: any[];
};

export type RpcResponse<T = any> = any;

export type Notification = {
  name: string;
  data?: any;
};
