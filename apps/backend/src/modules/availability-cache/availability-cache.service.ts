import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

const AVAILABILITY_CACHE_PREFIX = 'parklink:availability';
const AVAILABILITY_VERSION_KEY = `${AVAILABILITY_CACHE_PREFIX}:version`;
const DEFAULT_TTL_SECONDS = 60;

interface CacheEntry {
  expiresAt: number;
  value: string;
}

@Injectable()
export class AvailabilityCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(AvailabilityCacheService.name);
  private readonly ttlSeconds: number;
  private readonly memoryCache = new Map<string, CacheEntry>();
  private memoryVersion = 0;
  private readonly redis?: Redis;

  constructor(configService: ConfigService) {
    this.ttlSeconds = this.parseTtl(configService.get<string>('AVAILABILITY_CACHE_TTL_SECONDS'));
    const redisUrl = configService.get<string>('REDIS_URL') ?? configService.get<string>('UPSTASH_REDIS_URL');

    if (redisUrl) {
      this.redis = new Redis(redisUrl, {
        enableReadyCheck: false,
        lazyConnect: true,
        maxRetriesPerRequest: 1,
      });
      this.redis.on('error', (error) => {
        this.logger.warn(`Redis availability cache unavailable: ${error.message}`);
      });
    }
  }

  async get<T>(criteria: Record<string, unknown>): Promise<T | null> {
    const key = await this.buildKey(criteria);

    if (this.redis) {
      const cachedValue = await this.redis.get(key);
      return cachedValue ? (JSON.parse(cachedValue) as T) : null;
    }

    const entry = this.memoryCache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return JSON.parse(entry.value) as T;
  }

  async set<T>(criteria: Record<string, unknown>, value: T): Promise<void> {
    const key = await this.buildKey(criteria);
    const serializedValue = JSON.stringify(value);

    if (this.redis) {
      await this.redis.set(key, serializedValue, 'EX', this.ttlSeconds);
      return;
    }

    this.memoryCache.set(key, {
      expiresAt: Date.now() + this.ttlSeconds * 1000,
      value: serializedValue,
    });
  }

  async invalidateAvailability(): Promise<void> {
    if (this.redis) {
      await this.redis.incr(AVAILABILITY_VERSION_KEY);
      return;
    }

    this.memoryVersion += 1;
    this.memoryCache.clear();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }

  private async buildKey(criteria: Record<string, unknown>): Promise<string> {
    const version = await this.getVersion();
    return `${AVAILABILITY_CACHE_PREFIX}:v${version}:${this.stableStringify(criteria)}`;
  }

  private async getVersion(): Promise<string | number> {
    if (!this.redis) {
      return this.memoryVersion;
    }

    return (await this.redis.get(AVAILABILITY_VERSION_KEY)) ?? '0';
  }

  private stableStringify(value: unknown): string {
    if (Array.isArray(value)) {
      return `[${value.map((item) => this.stableStringify(item)).join(',')}]`;
    }

    if (value && typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>)
        .filter(([, entryValue]) => entryValue !== undefined)
        .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey));
      return `{${entries.map(([key, entryValue]) => `${key}:${this.stableStringify(entryValue)}`).join(',')}}`;
    }

    return JSON.stringify(value);
  }

  private parseTtl(rawTtl: string | undefined): number {
    const parsedTtl = Number(rawTtl);
    return Number.isFinite(parsedTtl) && parsedTtl > 0 ? parsedTtl : DEFAULT_TTL_SECONDS;
  }
}
