import type { Notification } from "../types";
import { BrowserRuntime } from "../browser";

export * from "./content-script";
export * from "./plugin";
export * from "./app-ui";

export class NotificationsClient {
  constructor(private name: string) {}

  public pushNotification(notif: Notification) {
    BrowserRuntime.sendMessage({
      channel: this.name,
      data: notif,
    });
  }
}
