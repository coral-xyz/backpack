import {
  CHANNEL_SECURE_BACKGROUND_REQUEST,
  CHANNEL_SECURE_BACKGROUND_RESPONSE,
  getLogger,
  InjectedRequestManager,
} from "@coral-xyz/common";
import type {
  SECURE_EVENTS,
  SecureEventOrigin,
  SecureResponseType,
  TransportSend,
  TransportSender,
} from "@coral-xyz/secure-background/types";
import { v4 } from "uuid";

const logger = getLogger("secure-client FromContentScriptTransportSender");

export class FromContentScriptTransportSender<
  X extends SECURE_EVENTS,
  R extends SecureResponseType = "response"
> implements TransportSender<X, R>
{
  private client: InjectedRequestManager;

  constructor(private origin: SecureEventOrigin) {
    this.client = new InjectedRequestManager(
      CHANNEL_SECURE_BACKGROUND_REQUEST,
      CHANNEL_SECURE_BACKGROUND_RESPONSE
    );
  }

  public send: TransportSend<X, R> = async (request) => {
    const id = v4();
    const requestWithId = { ...request, origin: this.origin, id };

    logger.debug("Request", requestWithId);

    return this.client
      .request({
        method: "ContentScriptTransportSenderRequest",
        params: [requestWithId],
      })
      .then((response) => {
        logger.debug("Response", response);
        return response;
      })
      .catch((e) => {
        const responseWithId = {
          name: request.name,
          id,
          error: e,
        };
        logger.error("Response", responseWithId);
        return responseWithId;
      });
  };
}
