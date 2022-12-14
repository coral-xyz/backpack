import type { RedisClientType } from "redis";
import { createClient } from "redis";

import { NOTIFICATIONS_QUEUE, REDIS_URL } from "../config";

export class Redis {
  private client: RedisClientType;
  private static instance: Redis;

  constructor() {
    this.client = createClient({
      url: REDIS_URL,
    });
    this.client.connect();
  }

  public static getInstance(): Redis {
    if (!this.instance) {
      this.instance = new Redis();
    }
    return this.instance;
  }

  // TODO: debounce here
  async send(message: string) {
    await this.client.rPush(NOTIFICATIONS_QUEUE, message);
  }
}
