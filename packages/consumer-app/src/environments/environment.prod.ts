export const environment = {
  production: true,
  nuxeo: {
    baseUrl: 'https://your-production-nuxeo.company.com/nuxeo',
    apiPath: '/api/v1',
    timeout: 30000,
    defaultCredentials: {
      username: '', // Should be configured at runtime
      password: ''  // Should be configured at runtime
    },
    features: {
      enableCaching: true,
      enableRetry: true,
      enableLogging: false, // Disable verbose logging in production
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
    enableLogging: false
  },
  logging: {
    level: 'error', // Only log errors in production
    enableConsole: false,
    enableStorage: true
  }
};