const SUCCESS_RESPONSE = "success";

export class Backend {
  connect(ctx: Context, onlyIfTrustedMaybe: boolean) {
    // todo
    return SUCCESS_RESPONSE;
  }

  disconnect(ctx: Context) {
    // todo
    return SUCCESS_RESPONSE;
  }
}

export type Context = {
  sender: any;
  sendResponse: any;
};
