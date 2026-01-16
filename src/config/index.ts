// ==================================================
// FILE: src/config/cloudinary.config.ts
// ==================================================
/**
 * Cloudinary configuration
 */

export const cloudinaryConfig = {
  IMAGE_PRESETS: {
    PROFILE: { width: 400, height: 400, crop: "fill" },
    POST: { width: 1080, crop: "limit" },
  },
};

// ==================================================
// FILE: src/config/db.config.ts
// ==================================================
/**
 * MongoDB configuration
 */

export const dbConfig = {
  MAX_POOL_SIZE: 20,
  AUTO_INDEX: false,
  CONNECT_TIMEOUT_MS: 10000,
  SOCKET_TIMEOUT_MS: 45000,
};

// ==================================================
// FILE: src/config/graphql.config.ts
// ==================================================
/**
 * GraphQL server configuration
 */

export const graphqlConfig = {
  ENABLED: true,
  ENDPOINT: "/graphql",

  PLAYGROUND: true, // env.NODE_ENV !== "production",
  INTROSPECTION: true, // env.NODE_ENV !== "production",

  QUERY_LIMITS: {
    DEPTH: 10,
    COMPLEXITY: 500,
  },
};

// ==================================================
// FILE: src/config/rateLimit.config.ts
// ==================================================
/**
 * Rate limiting configuration
 */

export const rateLimitConfig = {
  AUTH: {
    WINDOW_MS: 60 * 1000,
    MAX: 10,
  },
  GRAPHQL: {
    WINDOW_MS: 60 * 1000,
    MAX: 100,
  },
};

// ==================================================
// FILE: src/config/redis.config.ts
// ==================================================
/**
 * Redis configuration
 */

export const redisConfig = {
  MAX_RETRIES: 3,
  DEFAULT_TTL_SECONDS: 3600,
};

// ==================================================
// FILE: src/config/socket.config.ts
// ==================================================
/**
 * Socket.IO configuration
 */

export const socketConfig = {
  ENABLED: true,
  TRANSPORTS: ["websocket"], // websocket-only (production safe)

  PING_INTERVAL: 25000, // server → client
  PING_TIMEOUT: 20000, // wait before killing socket
};
