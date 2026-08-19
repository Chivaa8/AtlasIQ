export function createRateLimiter({ limit = 5, windowMs = 15 * 60 * 1000, now = Date.now } = {}) {
  const attempts = new Map();
  return (key) => {
    const time = now();
    const current = attempts.get(key);
    if (!current || current.resetAt <= time) {
      attempts.set(key, { count: 1, resetAt: time + windowMs });
      return false;
    }
    current.count += 1;
    return current.count > limit;
  };
}
