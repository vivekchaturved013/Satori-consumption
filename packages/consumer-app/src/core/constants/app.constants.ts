export const APP_CONSTANTS = {
  APP: {
    NAME: 'Nuxeo Consumer App',
    VERSION: '1.0.0',
    DESCRIPTION: 'Enterprise Nuxeo API Integration'
  } as const,
  HTTP: {
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
  } as const,
  CACHE: {
    TTL: 300000, // 5 minutes
    MAX_SIZE: 100
  } as const,
  UI: {
    DEBOUNCE_TIME: 300,
    ANIMATION_DURATION: 250,
    TOAST_DURATION: 5000
  } as const,
  STORAGE: {
    TOKEN_KEY: 'auth_token',
    USER_KEY: 'user_data',
    CONFIG_KEY: 'app_config'
  } as const
} as const;

export type AppInfo = typeof APP_CONSTANTS.APP;
export type HttpConfig = typeof APP_CONSTANTS.HTTP;
export type CacheConfig = typeof APP_CONSTANTS.CACHE;
export type UIConfig = typeof APP_CONSTANTS.UI;
export type StorageKeys = typeof APP_CONSTANTS.STORAGE;