import { redisStore } from "@trustify/config/redis";
import { OidcError } from "../types/oidc-error";

type CacheServiceOptions<T> = {
  key: string;
  ttl: number;
  type?: "set" | "string";
  lockExpiry?: number;
  lockKey?: string;
  maxRetries?: number;
  retryDelay?: number;
  onCacheMiss: () => Promise<T>;
};

/**
 * Caches data using Redis with support for string and set types.
 *
 * @param cacheOptions - Options for the cache service:
 *   - `key`: Unique key for the cache entry.
 *   - `ttl`: Time-to-live for the cached entry in seconds.
 *   - `type`: Data type to cache ("set" or "string"), defaults to "string".
 *   - `lockExpiry`: Duration in milliseconds for lock expiry (default: 5000ms).
 *   - `lockKey`: Custom lock key, defaults to `lock-${key}`.
 *   - `maxRetries`: Maximum retry attempts to acquire lock (default: 5).
 *   - `retryDelay`: Delay between retries in milliseconds (default: 1000ms).
 *   - `onCacheMiss`: Function to fetch data when cache miss occurs.
 *
 * @returns Cached data or undefined if not found or an error occurs.
 */
export const cache = async <T>(cacheOptions: CacheServiceOptions<T>): Promise<T | undefined> => {
  // Deconstruct cache options to extract individual parameters
  const {
    key,
    onCacheMiss,
    ttl,
    type = "string",
    lockExpiry = 5000,
    lockKey = `lock-${key}`,
    maxRetries = 5, // Set the maximum retry attempts for acquiring the lock
    retryDelay = 1000, // Set the delay (in milliseconds) before retrying to acquire the lock
  } = cacheOptions;

  // Function to acquire a lock to prevent concurrent access to the same cache key
  const acquireLock = async () => {
    // Attempt to set the lock key in Redis with an expiry time
    const result = await redisStore.set(lockKey, "locked", "EX", lockExpiry, "NX");

    // Return true if the lock was successfully acquired (i.e., the result is not null)
    return result !== null;
  };

  // Function to release the lock after the operation is complete
  const releaseLock = async () => {
    await redisStore.del(lockKey);
  };

  // Temporary variable to hold the lock state
  let lockAcquired = false;

  // Variable to keep track of the current number of retry attempts
  let retries = 0;

  // Loop to attempt acquiring the lock up to the maximum number of retries
  while (!lockAcquired && retries < maxRetries) {
    // Try to acquire the lock
    lockAcquired = await acquireLock();

    // If the lock is not acquired, log the retry attempt and wait before retrying
    if (!lockAcquired) {
      console.log(`Lock is already acquired, retrying... (${retries + 1}/${maxRetries})`);

      retries++; // Increment the retry count

      // Wait for the specified delay before the next retry
      await new Promise((res) => setTimeout(res, retryDelay));
    }
  }

  // If all retry attempts are exhausted and the lock is still not acquired
  if (!lockAcquired) {
    console.log("Failed to acquire lock after maximum retries. Please try again later.");

    return undefined; // Return undefined to indicate failure
  }

  try {
    // Handle caching based on the specified type
    if (type === "string") {
      // For string type, attempt to retrieve the cached value
      const cachedValue = await redisStore.get(key);

      // If a cached value is found, return it after parsing
      if (cachedValue) {
        return JSON.parse(cachedValue) as T;
      } else {
        // If no cached value is found, invoke the cache miss function
        const value = await onCacheMiss();

        // Cache the new value and assign an expiration
        await redisStore.multi().set(key, JSON.stringify(value)).expire(key, ttl).exec();

        return value; // Return the newly fetched value
      }
    } else if (type === "set") {
      // For set type, retrieve the members of the set from Redis
      const cachedMembers = await redisStore.smembers(key);

      // If no members are found, invoke the cache miss function
      if (cachedMembers.length === 0) {
        const value = await onCacheMiss();

        // Watch the key for changes during the transaction
        await redisStore.watch(key);

        // Begin a transaction
        // Serialize objects in the array
        // Serialize a single object
        // Add the serialized value(s) to the set
        // Set the expiry time for the cached entry
        // Execute the transaction
        await redisStore
          .multi()
          .sadd(
            key,
            ...(Array.isArray(value)
              ? value.map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v)))
              : [typeof value === "object" ? JSON.stringify(value) : String(value)]),
          )
          .expire(key, ttl)
          .exec();

        // Return the newly fetched value
        return value;
      } else {
        // If members are found, return them as the cached result
        return cachedMembers as unknown as T;
      }
    }
  } catch (error) {
    // Log any errors that occur during the caching process
    throw new OidcError({
      error: "cache_failed",
      message: "Failed to cache data",
      status: 500,

      //@ts-expect-error error is of type unknown
      stack: error.stack,
    });
  } finally {
    // Always release the lock at the end of the operation
    await releaseLock();
  }

  // Default return statement (this should not be reached)
  return undefined;
};
