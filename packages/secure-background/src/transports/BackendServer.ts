import type {
  SecureEvent,
  TransportHandler,
  TransportRemoveListener,
  TransportServer,
} from "../types";

export class BackendServer<T extends SecureEvent>
  implements TransportServer<T>
{
  private listener: TransportHandler<T> | null;

  constructor() {}

  public setListener = (handler) => {
    this.listener = handler;

    return () => {
      this.listener = null;
    };
  };
}
