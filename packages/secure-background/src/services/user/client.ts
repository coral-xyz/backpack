import type {
  SecureRequest,
  SecureRequestOptions,
  SecureResponse,
  TransportSender,
} from "../../types/transports";

export class UserClient {
  constructor(private secureBackgroundClient: TransportSender) {}

  public async ping(
    request: SecureRequest<"SECURE_USER_PING">["request"] = {}
  ): Promise<SecureResponse<"SECURE_USER_PING">> {
    return this.secureBackgroundClient.send({
      name: "SECURE_USER_PING",
      request,
    });
  }

  public async initWallet(
    request: SecureRequest<"SECURE_USER_INIT_WALLET">["request"]
  ): Promise<SecureResponse<"SECURE_USER_INIT_WALLET">> {
    return this.secureBackgroundClient.send({
      name: "SECURE_USER_INIT_WALLET",
      request,
    });
  }

  public async importBackup(
    request: SecureRequest<"SECURE_USER_IMPORT_BACKUP">["request"],
    options: SecureRequestOptions<"SECURE_USER_IMPORT_BACKUP"> = {}
  ): Promise<SecureResponse<"SECURE_USER_IMPORT_BACKUP">> {
    return this.secureBackgroundClient.send({
      name: "SECURE_USER_IMPORT_BACKUP",
      request,
      ...options,
    });
  }

  public async exportBackup(
    request: SecureRequest<"SECURE_USER_EXPORT_BACKUP">["request"] = {},
    options: SecureRequestOptions<"SECURE_USER_EXPORT_BACKUP"> = {}
  ): Promise<SecureResponse<"SECURE_USER_EXPORT_BACKUP">> {
    return this.secureBackgroundClient.send({
      name: "SECURE_USER_EXPORT_BACKUP",
      request,
      ...options,
    });
  }

  public async unlockKeyring(
    request: SecureRequest<"SECURE_USER_UNLOCK_KEYRING">["request"] = {},
    options: SecureRequestOptions<"SECURE_USER_UNLOCK_KEYRING"> = {}
  ): Promise<SecureResponse<"SECURE_USER_UNLOCK_KEYRING">> {
    return this.secureBackgroundClient.send({
      name: "SECURE_USER_UNLOCK_KEYRING",
      request,
      ...options,
    });
  }

  public async resetBackpack(
    request: SecureRequest<"SECURE_USER_RESET_BACKPACK">["request"] = {},
    options: SecureRequestOptions<"SECURE_USER_RESET_BACKPACK"> = {}
  ): Promise<SecureResponse<"SECURE_USER_RESET_BACKPACK">> {
    return this.secureBackgroundClient.send({
      name: "SECURE_USER_RESET_BACKPACK",
      request,
      ...options,
    });
  }

  public async setActiveUser(
    request: SecureRequest<"SECURE_USER_SET_ACTIVE">["request"],
    options: SecureRequestOptions<"SECURE_USER_SET_ACTIVE"> = {}
  ): Promise<SecureResponse<"SECURE_USER_SET_ACTIVE">> {
    return this.secureBackgroundClient.send({
      name: "SECURE_USER_SET_ACTIVE",
      request,
      ...options,
    });
  }

  public async setActiveWallet(
    request: SecureRequest<"SECURE_USER_SET_WALLET">["request"],
    options: SecureRequestOptions<"SECURE_USER_SET_WALLET"> = {}
  ): Promise<SecureResponse<"SECURE_USER_SET_WALLET">> {
    return this.secureBackgroundClient.send({
      name: "SECURE_USER_SET_WALLET",
      request,
      ...options,
    });
  }

  public async updateUser(
    request: SecureRequest<"SECURE_USER_UPDATE">["request"],
    options: SecureRequestOptions<"SECURE_USER_UPDATE"> = {}
  ): Promise<SecureResponse<"SECURE_USER_UPDATE">> {
    return this.secureBackgroundClient.send({
      name: "SECURE_USER_UPDATE",
      request,
      ...options,
    });
  }

  public async updateUserPreferences(
    request: SecureRequest<"SECURE_USER_UPDATE_PREFERENCES">["request"],
    options: SecureRequestOptions<"SECURE_USER_UPDATE_PREFERENCES"> = {}
  ): Promise<SecureResponse<"SECURE_USER_UPDATE_PREFERENCES">> {
    return this.secureBackgroundClient.send({
      name: "SECURE_USER_UPDATE_PREFERENCES",
      request,
      ...options,
    });
  }

  public async getUser(
    request: SecureRequest<"SECURE_USER_GET">["request"] = {},
    options: SecureRequestOptions<"SECURE_USER_GET"> = {}
  ): Promise<SecureResponse<"SECURE_USER_GET">> {
    return this.secureBackgroundClient.send({
      name: "SECURE_USER_GET",
      request,
      ...options,
    });
  }

  public async getAllUsers(
    request: SecureRequest<"SECURE_USER_GET_ALL">["request"] = {},
    options: SecureRequestOptions<"SECURE_USER_GET_ALL"> = {}
  ): Promise<SecureResponse<"SECURE_USER_GET_ALL">> {
    return this.secureBackgroundClient.send({
      name: "SECURE_USER_GET_ALL",
      request,
      ...options,
    });
  }

  public async getAllUsersWithAccounts(
    request: SecureRequest<"SECURE_USER_GET_ALL_WITH_ACCOUNTS">["request"] = {},
    options: SecureRequestOptions<"SECURE_USER_GET_ALL_WITH_ACCOUNTS"> = {}
  ): Promise<SecureResponse<"SECURE_USER_GET_ALL_WITH_ACCOUNTS">> {
    return this.secureBackgroundClient.send({
      name: "SECURE_USER_GET_ALL_WITH_ACCOUNTS",
      request,
      ...options,
    });
  }

  public async getKeyringState(
    request: SecureRequest<"SECURE_USER_GET_KEYRING_STATE">["request"] = {},
    options: SecureRequestOptions<"SECURE_USER_GET_KEYRING_STATE"> = {}
  ): Promise<SecureResponse<"SECURE_USER_GET_KEYRING_STATE">> {
    return this.secureBackgroundClient.send({
      name: "SECURE_USER_GET_KEYRING_STATE",
      request,
      ...options,
    });
  }

  public async getMnemonic(
    request: SecureRequest<"SECURE_USER_GET_MNEMONIC">["request"] = {},
    options: SecureRequestOptions<"SECURE_USER_GET_MNEMONIC"> = {}
  ): Promise<SecureResponse<"SECURE_USER_GET_MNEMONIC">> {
    return this.secureBackgroundClient.send({
      name: "SECURE_USER_GET_MNEMONIC",
      request,
      ...options,
    });
  }

  public async checkPassword(
    request: SecureRequest<"SECURE_USER_CHECK_PASSWORD">["request"],
    options: SecureRequestOptions<"SECURE_USER_CHECK_PASSWORD"> = {}
  ): Promise<SecureResponse<"SECURE_USER_CHECK_PASSWORD">> {
    return this.secureBackgroundClient.send({
      name: "SECURE_USER_CHECK_PASSWORD",
      request,
      ...options,
    });
  }

  public async approveOrigin(
    request: SecureRequest<"SECURE_USER_APPROVE_ORIGIN">["request"],
    options: SecureRequestOptions<"SECURE_USER_APPROVE_ORIGIN"> = {}
  ): Promise<SecureResponse<"SECURE_USER_APPROVE_ORIGIN">> {
    return this.secureBackgroundClient.send({
      name: "SECURE_USER_APPROVE_ORIGIN",
      request,
      allowResubmission: true,
      ...options,
    });
  }

  public async removeOrigin(
    request: SecureRequest<"SECURE_USER_REMOVE_ORIGIN">["request"],
    options: SecureRequestOptions<"SECURE_USER_REMOVE_ORIGIN"> = {}
  ): Promise<SecureResponse<"SECURE_USER_REMOVE_ORIGIN">> {
    return this.secureBackgroundClient.send({
      name: "SECURE_USER_REMOVE_ORIGIN",
      request,
      allowResubmission: true,
      ...options,
    });
  }
}
