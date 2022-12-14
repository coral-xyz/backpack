import redis, { RedisClient } from "redis";

import {
  NOTIFICATIONS_QUEUE,
  REDIS_HOST,
  REDIS_PASS,
  REDIS_PORT,
} from "../config";

export class Redis {
  private client: redis.RedisClientType;
  private static instance: Redis;

  constructor() {
    this.client = redis.createClient({
      url: `${REDIS_HOST}:${REDIS_PORT}`,
      password: REDIS_PASS,
    });
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
