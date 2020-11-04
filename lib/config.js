require('dotenv').config();

const isTrue = (value, defaultValue = false) => {
  if (/^(true|yes|1)$/i.test(value)) return true;
  if (/^(false|no|0)$/i.test(value)) return false;
  return defaultValue;
};

const config = {
  /**
   * Web & API
   */
  API_PORT: Number(process.env.PORT || 3000),

  /**
   * EGAT API
   */
  EGAT_URL: process.env.EGAT_URL,
  EGAT_USER: process.env.EGAT_USER,
  EGAT_PASSWORD: process.env.EGAT_PASSWORD,

  /**
   * TDM API (Weather, Forecast)
   */
  TMD_WEATHER_URL:  process.env.TMD_WEATHER_URL,
  TMD_WEATHER_UID: process.env.TMD_WEATHER_UID,
  TMD_WEATHER_UKEY: process.env.TMD_WEATHER_UKEY,

  /**
   * Redis
   */
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

  /**
   * Cache
   */
  CACHE_TTL: Number(process.env.CACHE_TTL || 3600),

  /**
   * Database
   */
  DB_URL: process.env.DB_URL || 'postgres://localhost:5432/local',
  /**
   * Rate limiter
   */
  HTTP_RATE_LIMIT_ENABLE: isTrue(process.env.HTTP_RATE_LIMIT_ENABLE, true),
  HTTP_RATE_LIMIT_HEADERS_ENABLE: isTrue(process.env.HTTP_RATE_LIMIT_HEADERS_ENABLE, true),
  HTTP_RATE_LIMIT_TTL: Number(process.env.HTTP_RATE_LIMIT_TTL || 60), // seconds
  HTTP_RATE_LIMIT_THRESHOLD: Number(process.env.HTTP_RATE_LIMIT_THRESHOLD || 20),

  /**
   * Utils
   */
  BROKER_STRATEGY: process.env.BROKER_STRATEGY || 'RoundRobin',
  METRIC_ENABLED: isTrue(process.env.METRIC_ENABLED),
  STAT_ENABLED: isTrue(process.env.STAT_ENABLED),
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  // formatter: ["json", "short", "simple", "full"]
  LOG_FORMATTER: process.env.LOG_FORMATTER || 'full',
  LOG_PATH: process.env.LOG_PATH || 'logs',
  LOG_MAX_FILE: Number(process.env.LOG_MAX_FILE || 5),
  ENCRYPT_ALGORITHM: process.env.NETWORK_ENCRYPT_ALGOR || 'aes-256-ctr',
  ENCRYPT_KEY: process.env.NETWORK_ENCRYPT_KEY || '===EkoKey===',
  WEB_SECRET: process.env.WEB_SECRET || 'secret',
  MOLECULER_MAX_FAILURES: Number(process.env.MOLECULER_MAX_FAILURES || 20),
  MOLECULER_REQUEST_TIME_OUT: Number(process.env.MOLECULER_REQUEST_TIME_OUT || 10000),
  MOLECULER_CIRCUIT_BREAKER_THRESHOLD: Number(
    process.env.MOLECULER_CIRCUIT_BREAKER_THRESHOLD || 0.2
  ),
  MOLECULER_REQUEST_RETRY: Number(process.env.MOLECULER_REQUEST_RETRY || 3),
};

module.exports = config;
