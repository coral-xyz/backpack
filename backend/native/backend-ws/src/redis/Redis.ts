import type { RedisClientType } from "redis";
import { createClient } from "redis";

import {
  NOTIFICATIONS_QUEUE,
  REDIS_HOST,
  REDIS_PASS,
  REDIS_PORT,
} from "../config";

export class Redis {
  private client: RedisClientType;
  private static instance: Redis;

  constructor() {
    this.client = createClient({
      socket: {
        host: REDIS_HOST,
        port: parseInt(REDIS_PORT),
      },
      // password: REDIS_PASS,
    });
    this.client.connect();
  }

  public static getInstance(): Redis {
    if (!this.instance) {
      this.instance = new Redis();
    }
    return this.instance;
  }

  async send(message: string) {
    await this.client.rPush(NOTIFICATIONS_QUEUE, message);
  }
}
