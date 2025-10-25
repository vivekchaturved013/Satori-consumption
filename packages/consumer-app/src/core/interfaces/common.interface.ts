export interface IBaseResponse<T = any> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly timestamp: Date;
}

export interface IServiceConfig {
  readonly baseUrl: string;
  readonly timeout: number;
  readonly retryAttempts?: number;
  readonly enableLogging?: boolean;
}

export interface ILogEntry {
  readonly timestamp: Date;
  readonly level: 'info' | 'warn' | 'error' | 'debug';
  readonly service: string;
  readonly message: string;
  readonly data?: any;
}

export interface IServiceState {
  readonly isInitialized: boolean;
  readonly isLoading: boolean;
  readonly lastError?: string;
}

export interface IHttpOptions {
  headers?: { [key: string]: string };
  timeout?: number;
  retries?: number;
}

export type ServiceStatus = 'idle' | 'loading' | 'success' | 'error';

export interface IErrorBoundary {
  message: string;
  stack?: string;
  timestamp: Date;
  userAgent?: string;
  url?: string;
}