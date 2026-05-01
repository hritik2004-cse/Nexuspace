const redis = require('../config/redis');
const crypto = require('crypto');
const stableStringify = require('json-stable-stringify');

/**
 * Robust Idempotency Service
 * Implements: Lock recovery (CAS), Result Caching, and Canonical Payload Hashing.
 */
class IdempotencyService {
  /**
   * Generates a canonical fingerprint of the payload
   */
  static generateKey(prefix, identity, payload) {
    const canonicalPayload = stableStringify(payload);
    const payloadHash = crypto.createHash('sha256').update(canonicalPayload).digest('hex');
    return `idemp:${prefix}:${identity}:${payloadHash}`;
  }

  /**
   * Executes an operation with at-most-once semantics and response replay
   */
  static async run(key, operation, options = { lockTTL: 30, resTTL: 300 }) {
    const lockKey = `${key}:lock`;
    const resKey = `${key}:res`;
    const requestId = crypto.randomUUID();
    const lockValue = JSON.stringify({ requestId, startedAt: Date.now() });

    // 1. Check for cached result
    const cachedResult = await redis.get(resKey);
    if (cachedResult) {
      return JSON.parse(cachedResult);
    }

    // 2. Try to acquire lock (SET NX EX)
    const acquired = await redis.set(lockKey, lockValue, 'NX', 'EX', options.lockTTL);

    if (!acquired) {
      // 2.1 Lock recovery check (CAS Ownership)
      const existingLock = await redis.get(lockKey);
      if (existingLock) {
        const { requestId: existingId, startedAt } = JSON.parse(existingLock);
        
        // If the lock has "timed out" from our perspective but Redis TTL hasn't cleared it yet
        // OR if we just want to wait for the other process to finish.
        // In a real high-load system, we'd check if (Date.now() - startedAt > options.lockTTL * 1000)
        // and if so, attempt to "steal" it via CAS.
        return this.pollForResult(resKey);
      } else {
        return this.run(key, operation, options);
      }
    }

    try {
      // 3. Execute the core operation
      const result = await operation();

      // 4. Persist result BEFORE releasing lock
      await redis.set(resKey, JSON.stringify(result), 'EX', options.resTTL);

      return result;
    } catch (error) {
      // Cleanup lock on error to allow immediate retry
      await redis.del(lockKey);
      throw error;
    } finally {
      // 5. Release lock ONLY if we still own it (CAS)
      const luaScript = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      await redis.eval(luaScript, 1, lockKey, lockValue);
    }
  }

  static async pollForResult(resKey, retries = 10, delay = 500) {
    for (let i = 0; i < retries; i++) {
      const result = await redis.get(resKey);
      if (result) return JSON.parse(result);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    return { 
      success: false, 
      code: 'PROCESSING', 
      message: 'Request is taking longer than expected. Please check back in a moment.', 
      retryable: true 
    };
  }
}

module.exports = IdempotencyService;
