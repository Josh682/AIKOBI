import { parseProxyList } from '@datascrapper/config';
import { logger } from '../utils/logger.js';

export interface ProxyConfig {
  server: string;      // e.g. "http://host:port"
  username?: string;
  password?: string;
}

/**
 * Round-robin proxy rotator with fallback to direct connection.
 * For free proxies: format is "host:port" or "user:pass@host:port"
 */
export class ProxyRotator {
  private proxies: ProxyConfig[] = [];
  private currentIndex = 0;
  private failCounts: Map<string, number> = new Map();
  private readonly MAX_FAILURES = 3;

  constructor(proxyListEnv?: string) {
    const rawProxies = parseProxyList(proxyListEnv);
    this.proxies = rawProxies.map(raw => this.parseProxy(raw));

    if (this.proxies.length > 0) {
      logger.info({ count: this.proxies.length }, '🔄 Proxy pool initialized');
    } else {
      logger.warn('⚠️  No proxies configured — using direct connection (dev mode)');
    }
  }

  /**
   * Get next proxy using round-robin. Skips failed proxies.
   * Returns null if no proxies configured (direct connection).
   */
  next(): ProxyConfig | null {
    if (this.proxies.length === 0) return null;

    // Find next healthy proxy
    let attempts = 0;
    while (attempts < this.proxies.length) {
      const proxy = this.proxies[this.currentIndex % this.proxies.length];
      this.currentIndex++;
      attempts++;

      if (!proxy) continue;

      const failures = this.failCounts.get(proxy.server) ?? 0;
      if (failures < this.MAX_FAILURES) {
        return proxy;
      }
    }

    // All proxies failed — reset and try again
    logger.warn('All proxies exceeded failure threshold, resetting counts');
    this.failCounts.clear();
    this.currentIndex = 0;
    return this.proxies[0] ?? null;
  }

  /**
   * Mark a proxy as failed (e.g. got 403/block response)
   */
  markFailed(server: string): void {
    const current = this.failCounts.get(server) ?? 0;
    this.failCounts.set(server, current + 1);
    logger.warn({ server, failCount: current + 1 }, 'Proxy marked as failed');
  }

  /**
   * Reset failure count for a proxy that worked
   */
  markSuccess(server: string): void {
    this.failCounts.delete(server);
  }

  get count(): number {
    return this.proxies.length;
  }

  private parseProxy(raw: string): ProxyConfig {
    // Format: user:pass@host:port  OR  host:port
    if (raw.includes('@')) {
      const [auth, hostPort] = raw.split('@');
      const [username, password] = (auth ?? '').split(':');
      return {
        server: `http://${hostPort}`,
        username,
        password,
      };
    }
    return { server: `http://${raw}` };
  }
}
