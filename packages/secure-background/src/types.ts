export interface SecureEvent {
  name: string;
  request: { [key: string]: string | number | null };
  response?: { [key: string]: string | number | null };
}
export type SecureRequest<T extends SecureEvent> = Omit<T, "response">;
export type SecureResponse<T extends SecureEvent> = Omit<T, "request">;

export type TransportHandler<E extends SecureEvent> = (
  request: SecureRequest<E>
) => Promise<SecureResponse<E>> | void;

export type TransportRemoveListener = () => void;

export interface TransportClient<T extends SecureEvent> {
  request: (request: SecureRequest<T>) => Promise<SecureResponse<T>>;
}

export interface TransportServer<T extends SecureEvent> {
  setListener: (handler: TransportHandler<T>) => TransportRemoveListener;
}
