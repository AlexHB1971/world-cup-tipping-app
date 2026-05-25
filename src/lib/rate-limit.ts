/**
 * Tiny fixed-window in-memory rate limiter. Single-instance only — fine
 * for our one-Node-process VPS deploy; would need Redis for a cluster.
 *
 * Buckets reset by themselves after the window expires, but we also need
 * occasional cleanup so the Map doesn't grow forever on a busy box.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const MAX_BUCKETS = 5_000;

function maybeSweep(now: number) {
  if (buckets.size <= MAX_BUCKETS) return;
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

export function takeToken(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  maybeSweep(now);
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (b.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((b.resetAt - now) / 1000)),
    };
  }
  b.count++;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}
