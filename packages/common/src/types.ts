export type Context = {
  sender: any;
};

export type RpcRequest = {
  id?: number;
  method: string;
  params: any[];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type RpcResponse<T = any> = any;

export type Notification = {
  name: string;
  data?: any;
};

export type Event = any;
export type EventHandler = (notif: any) => void;
export type ResponseHandler = [Function, Function];
