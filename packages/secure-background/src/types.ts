export interface ISecureEvent {
  name: string;
  params: { [key: string]: string | number | null };
  response?: { [key: string]: string | number | null };
}
export type SecureEvent<T extends ISecureEvent> = Omit<T, "response">;
export type SecureResponse<T extends ISecureEvent> = Omit<T, "params">;

export type TransportHandler<E extends ISecureEvent> = (
  event: SecureEvent<E>,
  respond: (response: SecureResponse<E>) => void
) => void;

export type TransportDestroy = () => void;

export interface Transport<T extends ISecureEvent> {
  addListener: (handler: TransportHandler<T>) => TransportDestroy;
  sendRequest: (event: SecureEvent<T>) => Promise<SecureResponse<T>>;
}
