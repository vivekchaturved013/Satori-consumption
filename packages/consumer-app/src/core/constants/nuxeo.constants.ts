export const NUXEO_CONSTANTS = {
  API: {
    ENDPOINTS: {
      BASE: '/nuxeo',
      REST_API: '/api/v1',
      JSON_CMIS: '/json/cmis',
      AUTOMATION: '/automation',
      LOGIN: '/automation/login',
      USER: '/user',
      DOCUMENTS: '/path',
      SEARCH: '/search/lang/NXQL/execute',
      HEALTH: '/runningstatus'
    } as const,
    HEADERS: {
      CONTENT_TYPE: 'application/json',
      ACCEPT: 'application/json',
      NXPROPERTIES: '*'
    } as const,
    TIMEOUT: 30000,
    DEFAULT_PAGE_SIZE: 20
  } as const,
  AUTH: {
    TYPE: 'Basic',
    DEFAULT_USERNAME: 'Administrator',
    TOKEN_STORAGE_KEY: 'nuxeo_auth_token',
    USER_STORAGE_KEY: 'nuxeo_user_data'
  } as const,
  DOCUMENT: {
    TYPES: {
      FILE: 'File',
      FOLDER: 'Folder',
      WORKSPACE: 'Workspace',
      DOMAIN: 'Domain'
    } as const,
    STATES: {
      PROJECT: 'project',
      APPROVED: 'approved',
      OBSOLETE: 'obsolete'
    } as const,
    DEFAULT_PATH: '/default-domain'
  } as const,
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000,
    BACKOFF_MULTIPLIER: 2
  } as const,
  CACHE: {
    DOCUMENTS_TTL: 300000, // 5 minutes
    USER_TTL: 900000, // 15 minutes
    CONFIG_TTL: 3600000 // 1 hour
  } as const,
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 4,
    MAX_TITLE_LENGTH: 255,
    ALLOWED_FILE_EXTENSIONS: ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.png']
  } as const
} as const;

export type NuxeoEndpoints = typeof NUXEO_CONSTANTS.API.ENDPOINTS;
export type NuxeoHeaders = typeof NUXEO_CONSTANTS.API.HEADERS;
export type NuxeoDocumentTypes = typeof NUXEO_CONSTANTS.DOCUMENT.TYPES;
export type NuxeoDocumentStates = typeof NUXEO_CONSTANTS.DOCUMENT.STATES;