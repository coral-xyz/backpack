import { CHANNEL_SECURE_BACKGROUND_EXTENSION_REQUEST } from "@coral-xyz/common";
import type {
  SECURE_EVENTS,
  SecureRequest,
  SecureResponse,
  TransportHandler,
  TransportSend,
  TransportSender,
} from "@coral-xyz/secure-background/clients";

export class FromExtensionTransportSender<X extends SECURE_EVENTS>
  implements TransportSender<X>
{
  public send: TransportSend<X> = <T extends X>(request) => {
    return new Promise<SecureResponse<T>>(
      (resolve: (response: SecureResponse<T>) => void) => {
        try {
          chrome.runtime.sendMessage(
            {
              channel: CHANNEL_SECURE_BACKGROUND_EXTENSION_REQUEST,
              data: request,
            },
            (response: SecureResponse<T>) => {
              if (chrome.runtime.lastError) {
                // always resolve so using await is safe.
                resolve({
                  name: request.name,
                  error: chrome.runtime.lastError,
                } as SecureResponse<T>);
              } else {
                resolve(response);
              }
            }
          );
        } catch (e) {
          // always resolve so using await is safe.
          resolve({
            name: request.name,
            error: e,
          } as SecureResponse<T>);
        }
      }
    );
  };
}
