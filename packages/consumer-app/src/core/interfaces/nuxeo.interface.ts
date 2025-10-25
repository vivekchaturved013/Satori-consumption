export interface NuxeoDocument {
  uid: string;
  path: string;
  type: string;
  title: string;
  description?: string;
  state: string;
  created: string;
  modified: string;
  author: string;
  properties: any;
  facets: string[];
}

export interface NuxeoResponse {
  entries: NuxeoDocument[];
  totalSize: number;
  pageSize: number;
  currentPageIndex: number;
}

export interface INuxeoServiceConfig {
  readonly baseUrl: string;
  readonly apiPath?: string;
  readonly timeout?: number;
  readonly username?: string;
  readonly password?: string;
}

export interface INuxeoServiceResponse<T = any> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly timestamp: Date;
}

export interface INuxeoServiceMethods {
  initialize(config: INuxeoServiceConfig): Promise<boolean>;
  testConnection(config?: INuxeoServiceConfig): Promise<boolean>;
  authenticate(username: string, password: string): Promise<boolean>;
  getChildren(path?: string): Promise<NuxeoDocument[]>;
  getDocument(uid: string): Promise<NuxeoDocument | null>;
  createDocument(parentPath: string, docData: Partial<NuxeoDocument>): Promise<NuxeoDocument | null>;
  updateDocument(uid: string, properties: any): Promise<NuxeoDocument | null>;
  deleteDocument(uid: string): Promise<boolean>;
  search(query: string): Promise<NuxeoDocument[]>;
  testSimpleApiCall(): Promise<any>;
  testSimpleLoginCall(): Promise<any>;
  testSimpleSearchCall(): Promise<any>;
  getCmisPermissions(): Promise<any>;
  cleanup(): void;
}

export interface INuxeoAuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: any;
}

export interface INuxeoConnectionState {
  status: 'connected' | 'disconnected' | 'testing';
  lastChecked?: Date;
  error?: string;
}

export interface ICmisPermission {
  key: string;
  permission: string[];
}

export interface ICmisResponse {
  permissions?: ICmisPermission[];
  [key: string]: any;
}