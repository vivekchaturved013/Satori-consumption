export const environment = {
  production: false,
  nuxeo: {
    baseUrl: '/nuxeo',
    apiPath: '/api/v1',
    timeout: 30000,
    defaultCredentials: {
      username: 'Administrator',
      password: 'Administrator'
    },
    features: {
      enableCaching: true,
      enableRetry: true,
      enableLogging: true,
      enableOfflineMode: false
    },
    endpoints: {
      health: '/runningstatus',
      cmis: '/json/cmis',
      automation: '/automation',
      restApi: '/api/v1'
    }
  },
  api: {
    timeout: 30000,
    retryAttempts: 3,
    enableLogging: true
  },
  logging: {
    level: 'debug',
    enableConsole: true,
    enableStorage: true
  }
};