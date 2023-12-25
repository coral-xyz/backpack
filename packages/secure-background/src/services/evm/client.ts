import type {
  SecureRequest,
  SecureRequestOptions,
  SecureResponse,
  TransportSender,
} from "../../types/transports";

export class EVMClient {
  constructor(private client: TransportSender) {}

  public async provider_send(
    request: SecureRequest<"SECURE_EVM_PROVIDER_SEND">["request"]
  ): Promise<SecureResponse<"SECURE_EVM_PROVIDER_SEND">> {
    return await this.client.send({
      name: "SECURE_EVM_PROVIDER_SEND",
      request,
    });
  }

  public async should_be_metamask(
    request: SecureRequest<"SECURE_EVM_SHOULD_BE_METAMASK">["request"] = {}
  ): Promise<SecureResponse<"SECURE_EVM_SHOULD_BE_METAMASK">> {
    return await this.client.send({
      name: "SECURE_EVM_SHOULD_BE_METAMASK",
      request,
    });
  }

  public async evm_requestAccounts(
    request: SecureRequest<"SECURE_EVM_REQUEST_ACCOUNTS">["request"],
    options: SecureRequestOptions<"SECURE_EVM_REQUEST_ACCOUNTS"> = {}
  ): Promise<SecureResponse<"SECURE_EVM_REQUEST_ACCOUNTS">> {
    return await this.client.send({
      name: "SECURE_EVM_REQUEST_ACCOUNTS",
      request,
      ...options,
    });
  }

  public async evm_getAccounts(
    request: SecureRequest<"SECURE_EVM_GET_ACCOUNTS">["request"] = {},
    options: SecureRequestOptions<"SECURE_EVM_GET_ACCOUNTS"> = {}
  ): Promise<SecureResponse<"SECURE_EVM_GET_ACCOUNTS">> {
    return await this.client.send({
      name: "SECURE_EVM_GET_ACCOUNTS",
      request,
      ...options,
    });
  }

  public async evm_signTransaction(
    request: SecureRequest<"SECURE_EVM_SIGN_TX">["request"],
    options: SecureRequestOptions<"SECURE_EVM_SIGN_TX"> = {}
  ): Promise<SecureResponse<"SECURE_EVM_SIGN_TX">> {
    return await this.client.send({
      name: "SECURE_EVM_SIGN_TX",
      request,
      ...options,
    });
  }

  public async evm_signMessage(
    request: SecureRequest<"SECURE_EVM_SIGN_MESSAGE">["request"],
    options: SecureRequestOptions<"SECURE_EVM_SIGN_MESSAGE"> = {}
  ): Promise<SecureResponse<"SECURE_EVM_SIGN_MESSAGE">> {
    return await this.client.send({
      name: "SECURE_EVM_SIGN_MESSAGE",
      request,
      ...options,
    });
  }

  public previewPublicKeys(
    request: SecureRequest<"SECURE_EVM_PREVIEW_PUBLIC_KEYS">["request"],
    options: SecureRequestOptions<"SECURE_EVM_PREVIEW_PUBLIC_KEYS"> = {}
  ): Promise<SecureResponse<"SECURE_EVM_PREVIEW_PUBLIC_KEYS">> {
    return this.client
      .send({
        name: "SECURE_EVM_PREVIEW_PUBLIC_KEYS",
        request,
        ...options,
      })
      .then((response) => {
        return response;
      });
  }
}
