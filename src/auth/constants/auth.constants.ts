export const AUTH_CONSTANTS = {
  JWT_STRATEGY: 'jwt',
  JWT_REFRESH_STRATEGY: 'jwt-refresh',
  REDIS_REFRESH_TOKEN_TTL: 604800, // 7 days in seconds
} as const;
