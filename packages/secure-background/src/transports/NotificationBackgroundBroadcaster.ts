import {
  BACKEND_EVENT,
  BrowserRuntimeCommon,
  BrowserRuntimeExtension,
  CHANNEL_SECURE_BACKGROUND_NOTIFICATION,
  getEnv,
  getLogger,
  postMessageFromWebViewToApp,
} from "@coral-xyz/common";
import type EventEmitter from "eventemitter3";

import type { TransportBroadcaster } from "../../types";
import { NotificationsClient } from "../background-clients/NotificationsClient";
import { type SecureNotification } from "../notifications";
import { SECURE_USER_NOTIFICATIONS_NAMES } from "../services/user/notifications";

const logger = getLogger("secure-background NotificationBackgroundBroadcaster");

export class NotificationBackgroundBroadcaster implements TransportBroadcaster {
  private paused: string | null = null;

  constructor(
    private localEmitter?: EventEmitter,
    private channel: string = CHANNEL_SECURE_BACKGROUND_NOTIFICATION
  ) {}

  public pause(lockName: string, force?: boolean) {
    if (!this.paused || force) {
      this.paused = lockName;
    }
  }

  public resume(lockName: string) {
    if (this.paused === lockName) this.paused = null;
  }

  broadcast = (request: SecureNotification): void => {
    if (this.paused) {
      return;
    }

    const event = {
      channel: this.channel,
      data: request,
    };

    logger.debug(request.name, request);

    // if we have local eventEmitter -> emit
    this.localEmitter?.emit("SECURE_LOCAL_BROADCAST", event);

    // TODO: removing-mobile-service-worker

    // send to Extension Popup
    BrowserRuntimeCommon.sendMessageToAnywhere(event);
    // aka: chrome.runtime.sendMessage(event);

    const platform = getEnv();
    const isMobile = platform.startsWith("mobile");

    if (!isMobile) {
      // send to active tabs / injected scripts
      BrowserRuntimeExtension.sendMessageToAllTabs(event).catch((e) => {
        logger.error(e);
      });
    } else {
      postMessageFromWebViewToApp(event);
    }
  };
}
