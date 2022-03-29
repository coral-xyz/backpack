import {
  Channel,
  PortChannel,
  NotificationsClient,
  CHANNEL_RPC_REQUEST,
  CHANNEL_NOTIFICATION,
  CONNECTION_POPUP_RPC,
  CONNECTION_POPUP_RESPONSE,
  CONNECTION_POPUP_NOTIFICATIONS,
} from "../common";

//
// All communication channels for sending data in/out of the background script
// to both the injected script and the UI app.
//
export class Io {
  // Channel to send notifications from the background to the injected script.
  public static notificationsInjected = Channel.client(CHANNEL_NOTIFICATION);

  // Server receiving rpc requests from the injected script.
  public static rpcServerInjected = Channel.server(CHANNEL_RPC_REQUEST);

  // Server rceiving rpc requests from the extension UI.
  public static rpcServerUi = PortChannel.server(CONNECTION_POPUP_RPC);

  // Server receiving responses from the extension UI. This is used when the
  // background script wants to request some type of user action from the UI,
  // e.g., the approval of a transaction.
  public static popupUiResponse = PortChannel.server(CONNECTION_POPUP_RESPONSE);

  // Client to send notifications from the background script to the extension UI.
  // This should only be created *after* the UI explicitly asks for it.
  public static notificationsUi = new NotificationsClient(
    CONNECTION_POPUP_NOTIFICATIONS
  );
}
