import { EventEmitter } from "eventemitter3";
import {
  Channel,
  ChannelClient,
  ChannelServer,
  PortChannel,
  PortChannelServer,
  NotificationsClient,
  BACKEND_EVENT,
  CHANNEL_RPC_REQUEST,
  CHANNEL_NOTIFICATION,
  CHANNEL_SOLANA_CONNECTION_INJECTED_REQUEST,
  CONNECTION_POPUP_RPC,
  CONNECTION_POPUP_RESPONSE,
  CONNECTION_POPUP_NOTIFICATIONS,
  SOLANA_CONNECTION_RPC_UI,
  NOTIFICATION_CONNECTION_URL_UPDATED,
} from "@200ms/common";

//
// All communication channels for sending data in/out of the background script
// to both the injected script and the UI app.
//
export class Io {
  // Channel to send notifications from the background to the injected script.
  public static notificationsInjected: ChannelClient;

  // Server receiving rpc requests from the injected script.
  public static rpcServerInjected: ChannelServer;

  // Server rceiving rpc requests from the extension UI.
  public static rpcServerUi: PortChannelServer;

  // Server receiving Connection API requests from the extension UI.
  public static solanaConnection: PortChannelServer;

  // Server receiving Connection API requests from the injected script.
  public static solanaConnectionInjected: ChannelServer;

  // Server receiving responses from the extension UI. This is used when the
  // background script wants to request some type of user action from the UI,
  // e.g., the approval of a transaction.
  public static popupUiResponse: PortChannelServer;

  // Main event emitter to send notifications from the background script to the
  // extension UI.
  public static events: any;

  // Client to send notifications from the background script to the extension UI.
  // This should only be created *after* the UI explicitly asks for it.
  public static notificationsUi: NotificationsClient;

  public static start() {
    // Extension UI server.
    Io.rpcServerUi = PortChannel.server(CONNECTION_POPUP_RPC);
    Io.notificationsUi = startNotificationsUi();

    // Injected client server.
    Io.rpcServerInjected = Channel.server(CHANNEL_RPC_REQUEST);
    Io.popupUiResponse = PortChannel.server(CONNECTION_POPUP_RESPONSE);
    Io.notificationsInjected = Channel.client(CHANNEL_NOTIFICATION);

    // Solana connection proxy server.
    Io.solanaConnection = PortChannel.server(SOLANA_CONNECTION_RPC_UI);
    Io.solanaConnectionInjected = Channel.server(
      CHANNEL_SOLANA_CONNECTION_INJECTED_REQUEST
    );

    Io.events = new EventEmitter();
  }
}

function startNotificationsUi(): NotificationsClient {
  const notificationsUi = new NotificationsClient(
    CONNECTION_POPUP_NOTIFICATIONS
  );
  Io.events.on(BACKEND_EVENT, (notification) => {
    //
    // Dispatch all notifications to the extension popup UI. This channel
    // will also handle plugins in an additional routing step.
    //
    notificationsUi.pushNotification(notification);

    //
    // Dispatch a subset of notifications to injected web apps.
    //
    switch (notification.name) {
      case NOTIFICATION_CONNECTION_URL_UPDATED:
        Io.notificationsInjected.sendMessageActiveTab(notification);
        break;
      default:
        break;
    }
  });
  return notificationsUi;
}
