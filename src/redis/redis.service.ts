import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  @Inject('REDIS_CLIENT')
  private readonly client: RedisClientType;

  async set(key: string, value: string | number, ttl?: number) {
    await this.client.set(key, value, { EX: ttl });
  }

  async get(key: string) {
    return await this.client.get(key);
  }

  async del(key: string) {
    await this.client.del(key);
  }

  async expire(key: string, ttl: number) {
    await this.client.expire(key, ttl);
  }
}
