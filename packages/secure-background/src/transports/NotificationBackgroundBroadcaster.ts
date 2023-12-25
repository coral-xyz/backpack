import {
  BACKEND_EVENT,
  BrowserRuntimeCommon,
  BrowserRuntimeExtension,
  CHANNEL_SECURE_BACKGROUND_NOTIFICATION,
  getLogger,
  IS_MOBILE,
  postMessageFromWebViewToApp,
} from "@coral-xyz/common";
import type { TransportBroadcaster } from "@coral-xyz/secure-background/types";
import type EventEmitter from "eventemitter3";

import { NotificationsClient } from "../background-clients/NotificationsClient";
import { type SecureNotification } from "../notifications";
import { SECURE_USER_NOTIFICATIONS_NAMES } from "../services/user/notifications";

const logger = getLogger("secure-background NotificationBackgroundBroadcaster");

export class NotificationBackgroundBroadcaster implements TransportBroadcaster {
  constructor(
    private emitter: EventEmitter,
    private channel: string = CHANNEL_SECURE_BACKGROUND_NOTIFICATION
  ) {
    // emit NOTIFICATION_USER_UPDATED for all legacy events.
    // emitter.on(BACKEND_EVENT, (event) => {
    //   if (!SECURE_USER_NOTIFICATIONS_NAMES.includes(event.data.name)) {
    //     const notificationsClient = new NotificationsClient(this);
    //     notificationsClient.userUpdated();
    //   }
    // });
  }

  broadcast = (request: SecureNotification): void => {
    const event = {
      channel: this.channel,
      data: request,
    };

    logger.debug(request.name, request);

    // emit legacy Notification
    // this.emitter.emit(BACKEND_EVENT, request);

    // TODO: removing-mobile-service-worker

    // send to Extension Popup
    BrowserRuntimeCommon.sendMessageToAnywhere(event);
    // aka: chrome.runtime.sendMessage(event);

    if (!IS_MOBILE) {
      // send to active tabs / injected scripts
      BrowserRuntimeExtension.sendMessageActiveTabs(event).catch((e) => {
        logger.error(e);
      });
    } else {
      postMessageFromWebViewToApp(event);
    }

    // aka: chrome.tabs.query({ active: true, currentWindow: true })
    //   .then(tabs => Promise.all(tabs.map((tab) => {
    //     if (tab.id) {
    //       return chrome.tabs.sendMessage(tab.id, event);
    //     }
    //     return Promise.resolve();
    //   })))
  };
}
