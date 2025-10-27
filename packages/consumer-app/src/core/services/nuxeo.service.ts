import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap, retry, timeout } from 'rxjs/operators';

import { LoggingService } from './logging.service';
import { 
  NuxeoDocument, 
  NuxeoResponse, 
  INuxeoServiceConfig, 
  INuxeoServiceResponse, 
  INuxeoServiceMethods,
  INuxeoAuthState,
  INuxeoConnectionState,
  ICmisResponse
} from '../interfaces/nuxeo.interface';
import { NUXEO_CONSTANTS } from '../constants/nuxeo.constants';
import { APP_CONSTANTS } from '../constants/app.constants';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NuxeoService implements INuxeoServiceMethods {
  private readonly http = inject(HttpClient);
  private readonly logger = inject(LoggingService);

  // Configuration - configurable Nuxeo server settings
  private readonly _config = signal<INuxeoServiceConfig>({
    baseUrl: environment.nuxeo.baseUrl,
    apiPath: environment.nuxeo.apiPath,
    timeout: environment.nuxeo.timeout
  });
  
  // Authentication state
  private readonly _authState = signal<INuxeoAuthState>({
    isAuthenticated: false,
    token: null,
    user: null
  });
  
  // Connection state
  private readonly _connectionState = signal<INuxeoConnectionState>({
    status: 'disconnected'
  });
  
  // Document management state
  private readonly _currentPath = signal<string>(NUXEO_CONSTANTS.DOCUMENT.DEFAULT_PATH);
  private readonly _documents = signal<NuxeoDocument[]>([]);
  private readonly _isLoading = signal<boolean>(false);

  // Public readonly signals
  public readonly config = this._config.asReadonly();
  public readonly authState = this._authState.asReadonly();
  public readonly connectionState = this._connectionState.asReadonly();
  public readonly currentPath = this._currentPath.asReadonly();
  public readonly documents = this._documents.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();

  // Computed getters for backward compatibility
  public get isAuthenticated(): boolean {
    return this._authState().isAuthenticated;
  }

  public get user(): any {
    return this._authState().user;
  }

  public get documentList(): NuxeoDocument[] {
    return this._documents();
  }

  public get currentFolderPath(): string {
    return this._currentPath();
  }

  public get currentConfig(): INuxeoServiceConfig {
    return { ...this._config() };
  }

  public getConnectionStatus(): 'connected' | 'disconnected' | 'testing' {
    return this._connectionState().status;
  }

  constructor() {
    // Initialize with stored auth token if available
    const storedToken = localStorage.getItem(NUXEO_CONSTANTS.AUTH.TOKEN_STORAGE_KEY);
    if (storedToken) {
      this._authState.update(state => ({ ...state, token: storedToken, isAuthenticated: true }));
    }
    
    this.logger.info('NuxeoService', 'Service instantiated', { config: this._config() });
  }

  /**
   * Initialize the service with configuration
   */
  public async initialize(config: INuxeoServiceConfig): Promise<boolean> {
    try {
      this._isLoading.set(true);
      this.logger.info('NuxeoService', 'Initializing service', { config });

      // Validate configuration
      if (!this.validateConfig(config)) {
        throw new Error('Invalid configuration provided');
      }

      // Update configuration
      this._config.set({ ...this._config(), ...config });
      
      // Test connection
      const testResult = await this.testConnection(config);
      if (!testResult) {
        throw new Error('Connection test failed');
      }

      this.logger.info('NuxeoService', 'Service initialized successfully');
      return true;

    } catch (error) {
      this.logger.error('NuxeoService', 'Failed to initialize service', error);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  // Configuration methods
  updateConfig(newConfig: Partial<INuxeoServiceConfig>): void {
    this._config.update(config => ({ ...config, ...newConfig }));
    // Reset connection status when config changes
    this._connectionState.update(state => ({ ...state, status: 'disconnected' }));
    this.logger.info('NuxeoService', 'Configuration updated', { newConfig });
  }

  // Test connection to Nuxeo server
  async testConnection(config?: INuxeoServiceConfig): Promise<boolean> {
    try {
      this._connectionState.update(state => ({ ...state, status: 'testing' }));
      const testConfig = config || this._config();
      console.log('Testing connection with config:', testConfig);
      this.logger.info('NuxeoService', 'Testing connection', { baseUrl: testConfig.baseUrl });
      
      // Test basic connectivity with Nuxeo health check endpoint
      const response = await this.http.get(`${testConfig.baseUrl}${NUXEO_CONSTANTS.API.ENDPOINTS.HEALTH}`, {
        headers: new HttpHeaders({
          'Content-Type': NUXEO_CONSTANTS.API.HEADERS.CONTENT_TYPE
        })
      }).toPromise();
      
      const isConnected = !!response;
      this._connectionState.update(state => ({ 
        ...state, 
        status: isConnected ? 'connected' : 'disconnected',
        lastChecked: new Date(),
        error: undefined
      }));
      
      this.logger.info('NuxeoService', `Connection test ${isConnected ? 'successful' : 'failed'}`);
      return isConnected;
    } catch (error) {
      this.logger.error('NuxeoService', 'Connection test failed', error);
      this._connectionState.update(state => ({ 
        ...state, 
        status: 'disconnected',
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
      return false;
    }
  }

  // Authentication methods
  async authenticate(username: string, password: string): Promise<boolean> {
    try {
      this._isLoading.set(true);
      const credentials = btoa(`${username}:${password}`);
      const config = this._config();
      
      this.logger.info('NuxeoService', 'Authenticating user', { username });
      
      const headers = new HttpHeaders({
        'Authorization': `Basic ${credentials}`,
        'Content-Type': NUXEO_CONSTANTS.API.HEADERS.CONTENT_TYPE
      });

      const response = await this.http.post(
        `${config.baseUrl}${config.apiPath}${NUXEO_CONSTANTS.API.ENDPOINTS.AUTOMATION}/login`, 
        {}, 
        { headers }
      ).toPromise();
      
      if (response) {
        this._authState.set({
          isAuthenticated: true,
          token: credentials,
          user: null
        });
        localStorage.setItem(NUXEO_CONSTANTS.AUTH.TOKEN_STORAGE_KEY, credentials);
        await this.getCurrentUser();
        this.logger.info('NuxeoService', 'Authentication successful');
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('NuxeoService', 'Authentication failed', error);
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }

  async getCurrentUser(): Promise<any> {
    try {
      const config = this._config();
      const user = await this.http.get(
        `${config.baseUrl}${config.apiPath}${NUXEO_CONSTANTS.API.ENDPOINTS.USER}/Administrator`, 
        { headers: this.getAuthHeaders() }
      ).toPromise();
      
      this._authState.update(state => ({ ...state, user }));
      this.logger.info('NuxeoService', 'User data retrieved');
      return user;
    } catch (error) {
      this.logger.error('NuxeoService', 'Failed to get current user', error);
      return null;
    }
  }

  logout(): void {
    this._authState.set({
      isAuthenticated: false,
      token: null,
      user: null
    });
    localStorage.removeItem(NUXEO_CONSTANTS.AUTH.TOKEN_STORAGE_KEY);
    this.logger.info('NuxeoService', 'User logged out');
  }

  // Simple test API call with hardcoded values
  async testSimpleApiCall(): Promise<any> {
    try {
      const apiUrl = 'http://localhost:8080/nuxeo/json/cmis'; // Direct call to port 8080
      this.logger.info('NuxeoService', `Testing simple API call to: ${apiUrl}`);
      
      // Hardcoded authentication - Administrator:Administrator
      const credentials = btoa('Administrator:Administrator');
      this.logger.info('NuxeoService', 'Using hardcoded Administrator credentials');
      
      // Simple headers
      const headers = new HttpHeaders({
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      });

      // Direct API call to CMIS endpoint - proxied to http://localhost:8080/nuxeo/json/cmis
      const response = await this.http.get(apiUrl, { headers }).toPromise();
      
      this.logger.info('NuxeoService', 'Simple API call successful', response);
      return response;
    } catch (error) {
      this.logger.error('NuxeoService', 'Simple API call failed', error);
      throw error;
    }
  }

  // Simple login API test with hardcoded values
  async testSimpleLoginCall(): Promise<any> {
    try {
      const loginUrl = 'http://localhost:8080/nuxeo/api/v1/automation/login'; // Direct call to login endpoint
      this.logger.info('NuxeoService', `Testing simple login API call to: ${loginUrl}`);
      
      // Hardcoded authentication - Administrator:Administrator
      const credentials = btoa('Administrator:Administrator');
      this.logger.info('NuxeoService', 'Using hardcoded Administrator credentials for login');
      
      // Login headers
      const headers = new HttpHeaders({
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      });

      // Direct API call to login endpoint
      const response = await this.http.post(loginUrl, {}, { headers }).toPromise();
      
      this.logger.info('NuxeoService', 'Simple login API call successful', response);
      return response;
    } catch (error) {
      this.logger.error('NuxeoService', 'Simple login API call failed', error);
      throw error;
    }
  }

  // Simple document search API test with hardcoded values
  async testSimpleSearchCall(): Promise<any> {
    try {
      // Simple NXQL query to get all documents
      const query = "SELECT * FROM Document WHERE ecm:isTrashed = 0 ORDER BY dc:modified DESC";
      const searchUrl = `http://localhost:8080/nuxeo/api/v1/search/execute?currentPageIndex=0&pageSize=15&query=${encodeURIComponent(query)}`;
      
      this.logger.info('NuxeoService', `Testing simple search API call to: ${searchUrl}`);
      
      // Hardcoded authentication - Administrator:Administrator
      const credentials = btoa('Administrator:Administrator');
      this.logger.info('NuxeoService', 'Using hardcoded Administrator credentials for search');
      
      // Search headers
      const headers = new HttpHeaders({
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      });

      // Direct API call to search endpoint
      const response = await this.http.get(searchUrl, { headers }).toPromise();
      
      this.logger.info('NuxeoService', 'Simple search API call successful', response);
      return response;
    } catch (error) {
      this.logger.error('NuxeoService', 'Simple search API call failed', error);
      throw error;
    }
  }

  // Domain documents API call for data table display
  async getDomainDocuments(): Promise<any> {
    try {
      const domainDocsUrl = 'http://localhost:8080/nuxeo/api/v1/search/pp/domain_documents/execute?currentPageIndex=0&offset=0&pageSize=16&queryParams=%2F';
      
      this.logger.info('NuxeoService', `Fetching domain documents from: ${domainDocsUrl}`);
      
      // Hardcoded authentication - Administrator:Administrator
      const credentials = btoa('Administrator:Administrator');
      this.logger.info('NuxeoService', 'Using hardcoded Administrator credentials for domain documents');
      
      // Headers
      const headers = new HttpHeaders({
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      });

      // Direct API call to domain documents endpoint
      const response = await this.http.get(domainDocsUrl, { headers }).toPromise();
      
      this.logger.info('NuxeoService', 'Domain documents API call successful', response);
      return response;
    } catch (error) {
      this.logger.error('NuxeoService', 'Domain documents API call failed', error);
      throw error;
    }
  }

  /**
   * Get recently edited documents using NXQL query
   */
  async getRecentlyEditedDocuments(): Promise<any> {
    try {
      this.logger.info('NuxeoService', 'Fetching recently edited documents');
      
      const credentials = btoa('Administrator:Administrator');
      const headers = new HttpHeaders({
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      });

      // Focus on File documents that were recently modified (edited)
      const query = `SELECT * FROM Document WHERE ecm:isVersion = 0 AND ecm:isTrashed = 0 AND ecm:primaryType = 'File' ORDER BY dc:modified DESC`;
      
      const response = await this.http.get<any>(
        'http://localhost:8080/nuxeo/api/v1/search/lang/NXQL/execute',
        {
          headers: headers,
          params: {
            query: query,
            pageSize: '8'
          }
        }
      ).toPromise();
      
      this.logger.info('NuxeoService', 'Recently edited documents fetched', { 
        count: response?.entries?.length || 0 
      });
      
      return response;
    } catch (error) {
      this.logger.error('NuxeoService', 'Failed to fetch recently edited documents', error);
      throw error;
    }
  }

  /**
   * Get recently viewed documents (fallback to collections and workspaces)
   */
  async getRecentlyViewedDocuments(): Promise<any> {
    try {
      this.logger.info('NuxeoService', 'Fetching recently viewed documents');
      
      const credentials = btoa('Administrator:Administrator');
      const headers = new HttpHeaders({
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      });

      // Try audit log first for actual viewed documents
      try {
        const response = await this.http.get<any>(
          'http://localhost:8080/nuxeo/api/v1/audit',
          {
            headers: headers,
            params: {
              eventIds: 'documentOpened',
              pageSize: '8'
            }
          }
        ).toPromise();
        
        if (response?.entries?.length > 0) {
          this.logger.info('NuxeoService', 'Recently viewed documents from audit log', { 
            count: response.entries.length 
          });
          return response;
        }
      } catch (auditError) {
        this.logger.warn('NuxeoService', 'Audit log not available, using Collection/Workspace fallback');
      }

      // Fallback to Collections and Workspaces (different from edited files)
      const query = `SELECT * FROM Document WHERE ecm:isVersion = 0 AND ecm:isTrashed = 0 AND ecm:primaryType IN ('Collection', 'Workspace') ORDER BY dc:created DESC`;
      
      const response = await this.http.get<any>(
        'http://localhost:8080/nuxeo/api/v1/search/lang/NXQL/execute',
        {
          headers: headers,
          params: {
            query: query,
            pageSize: '8'
          }
        }
      ).toPromise();
      
      this.logger.info('NuxeoService', 'Recently viewed documents (fallback) fetched', { 
        count: response?.entries?.length || 0 
      });
      
      return response;
    } catch (error) {
      this.logger.error('NuxeoService', 'Failed to fetch recently viewed documents', error);
      throw error;
    }
  }

  /**
   * Get favorite documents for current user
   */
  async getFavoriteDocuments(): Promise<any> {
    try {
      this.logger.info('NuxeoService', 'Fetching favorite documents');
      
      const credentials = btoa('Administrator:Administrator');
      const headers = new HttpHeaders({
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      });

      // First try to get actual favorites
      try {
        const favoriteQuery = `SELECT * FROM Document WHERE ecm:isVersion = 0 AND ecm:isTrashed = 0 AND ecm:tag LIKE '%favorite%' ORDER BY dc:modified DESC`;
        
        const favoriteResponse = await this.http.get<any>(
          'http://localhost:8080/nuxeo/api/v1/search/lang/NXQL/execute',
          {
            headers: headers,
            params: {
              query: favoriteQuery,
              pageSize: '8'
            }
          }
        ).toPromise();
        
        if (favoriteResponse?.entries?.length > 0) {
          this.logger.info('NuxeoService', 'Favorite documents found', { 
            count: favoriteResponse.entries.length 
          });
          return favoriteResponse;
        }
      } catch (favoriteError) {
        this.logger.warn('NuxeoService', 'Could not fetch tagged favorites, using fallback');
      }

      // Fallback to domain and folder documents (different content type)
      const query = `SELECT * FROM Document WHERE ecm:isVersion = 0 AND ecm:isTrashed = 0 AND ecm:primaryType IN ('Domain', 'Folder') ORDER BY dc:title ASC`;
      
      const response = await this.http.get<any>(
        'http://localhost:8080/nuxeo/api/v1/search/lang/NXQL/execute',
        {
          headers: headers,
          params: {
            query: query,
            pageSize: '8'
          }
        }
      ).toPromise();
      
      this.logger.info('NuxeoService', 'Favorite documents (fallback) fetched', { 
        count: response?.entries?.length || 0 
      });
      
      return response;
    } catch (error) {
      this.logger.error('NuxeoService', 'Failed to fetch favorite documents', error);
      throw error;
    }
  }

  /**
   * Get document by path - retrieves document details using the document path
   */
  async getDocumentByPath(documentPath: string): Promise<any> {
    try {
      this.logger.info('NuxeoService', 'Fetching document by path', { documentPath });
      
      const credentials = btoa('Administrator:Administrator');
      const headers = new HttpHeaders({
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      });

      // Use the path-based API endpoint
      const response = await this.http.get<any>(
        `http://localhost:8080/nuxeo/api/v1/path${documentPath}`,
        {
          headers: headers
        }
      ).toPromise();
      
      this.logger.info('NuxeoService', 'Document fetched by path successfully', { 
        path: documentPath,
        title: response?.title,
        uid: response?.uid
      });
      
      return response;
    } catch (error) {
      this.logger.error('NuxeoService', 'Failed to fetch document by path', error);
      throw error;
    }
  }

  /**
   * Get user tasks
   */
  async getUserTasks(): Promise<any> {
    try {
      this.logger.info('NuxeoService', 'Fetching user tasks');
      
      const credentials = btoa('Administrator:Administrator');
      const headers = new HttpHeaders({
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      });

      const response = await this.http.get<any>(
        'http://localhost:8080/nuxeo/api/v1/task',
        {
          headers: headers,
          params: {
            userId: 'Administrator'
          }
        }
      ).toPromise();
      
      this.logger.info('NuxeoService', 'User tasks fetched', { 
        count: response?.entries?.length || 0 
      });
      
      return response;
    } catch (error) {
      this.logger.error('NuxeoService', 'Failed to fetch user tasks', error);
      throw error;
    }
  }

  // CMIS API integration
  async getCmisPermissions(): Promise<ICmisResponse> {
    try {
      this.logger.info('NuxeoService', 'Fetching CMIS permissions');
      const config = this._config();
      
      const response = await this.http.get<ICmisResponse>(
        `${config.baseUrl}${NUXEO_CONSTANTS.API.ENDPOINTS.JSON_CMIS}`,
        { headers: this.getAuthHeaders() }
      ).toPromise();
      
      this.logger.info('NuxeoService', 'CMIS permissions retrieved successfully');
      return response || {};
    } catch (error) {
      this.logger.error('NuxeoService', 'Failed to get CMIS permissions', error);
      throw error;
    }
  }

  // Document management methods
  async getChildren(path: string = NUXEO_CONSTANTS.DOCUMENT.DEFAULT_PATH): Promise<NuxeoDocument[]> {
    try {
      this._isLoading.set(true);
      this._currentPath.set(path);
      const config = this._config();
      
      this.logger.info('NuxeoService', 'Fetching children documents', { path });
      
      const response = await this.http.get<NuxeoResponse>(
        `${config.baseUrl}${config.apiPath}${NUXEO_CONSTANTS.API.ENDPOINTS.DOCUMENTS}${path}/@children`, 
        { headers: this.getAuthHeaders() }
      ).toPromise();
      
      const documents = response?.entries || [];
      this._documents.set(documents);
      this.logger.info('NuxeoService', `Retrieved ${documents.length} documents`);
      return documents;
    } catch (error) {
      this.logger.error('NuxeoService', 'Failed to get children', error);
      return [];
    } finally {
      this._isLoading.set(false);
    }
  }

  async getDocument(uid: string): Promise<NuxeoDocument | null> {
    try {
      const config = this._config();
      this.logger.info('NuxeoService', 'Fetching document', { uid });
      
      const doc = await this.http.get<NuxeoDocument>(
        `${config.baseUrl}${config.apiPath}/id/${uid}`, 
        { headers: this.getAuthHeaders() }
      ).toPromise();
      
      this.logger.info('NuxeoService', 'Document retrieved successfully');
      return doc || null;
    } catch (error) {
      this.logger.error('NuxeoService', 'Failed to get document', error);
      return null;
    }
  }

  async createDocument(parentPath: string, docData: Partial<NuxeoDocument>): Promise<NuxeoDocument | null> {
    try {
      this._isLoading.set(true);
      const config = this._config();
      
      this.logger.info('NuxeoService', 'Creating document', { parentPath, docData });
      
      const doc = await this.http.post<NuxeoDocument>(
        `${config.baseUrl}${config.apiPath}${NUXEO_CONSTANTS.API.ENDPOINTS.DOCUMENTS}${parentPath}`, 
        {
          "entity-type": "document",
          "type": docData.type || NUXEO_CONSTANTS.DOCUMENT.TYPES.FILE,
          "name": docData.title,
          "properties": {
            "dc:title": docData.title,
            "dc:description": docData.description || ""
          }
        }, 
        { headers: this.getAuthHeaders() }
      ).toPromise();
      
      if (doc) {
        // Refresh the current folder
        await this.getChildren(this._currentPath());
        this.logger.info('NuxeoService', 'Document created successfully');
      }
      
      return doc || null;
    } catch (error) {
      this.logger.error('NuxeoService', 'Failed to create document', error);
      return null;
    } finally {
      this._isLoading.set(false);
    }
  }

  async updateDocument(uid: string, properties: any): Promise<NuxeoDocument | null> {
    try {
      const config = this._config();
      this.logger.info('NuxeoService', 'Updating document', { uid, properties });
      
      const doc = await this.http.put<NuxeoDocument>(
        `${config.baseUrl}${config.apiPath}/id/${uid}`, 
        {
          "entity-type": "document",
          "properties": properties
        }, 
        { headers: this.getAuthHeaders() }
      ).toPromise();
      
      this.logger.info('NuxeoService', 'Document updated successfully');
      return doc || null;
    } catch (error) {
      this.logger.error('NuxeoService', 'Failed to update document', error);
      return null;
    }
  }

  async deleteDocument(uid: string): Promise<boolean> {
    try {
      const config = this._config();
      this.logger.info('NuxeoService', 'Deleting document', { uid });
      
      await this.http.delete(
        `${config.baseUrl}${config.apiPath}/id/${uid}`, 
        { headers: this.getAuthHeaders() }
      ).toPromise();
      
      // Refresh the current folder
      await this.getChildren(this._currentPath());
      this.logger.info('NuxeoService', 'Document deleted successfully');
      return true;
    } catch (error) {
      this.logger.error('NuxeoService', 'Failed to delete document', error);
      return false;
    }
  }

  // Search functionality
  async search(query: string): Promise<NuxeoDocument[]> {
    try {
      this._isLoading.set(true);
      const config = this._config();
      
      this.logger.info('NuxeoService', 'Performing search', { query });
      
      const response = await this.http.get<NuxeoResponse>(
        `${config.baseUrl}${config.apiPath}${NUXEO_CONSTANTS.API.ENDPOINTS.SEARCH}`, 
        {
          headers: this.getAuthHeaders(),
          params: {
            query: `SELECT * FROM Document WHERE ecm:fulltext = "${query}" AND ecm:isVersion = 0 AND ecm:isTrashed = 0`
          }
        }
      ).toPromise();
      
      const results = response?.entries || [];
      this.logger.info('NuxeoService', `Search completed with ${results.length} results`);
      return results;
    } catch (error) {
      this.logger.error('NuxeoService', 'Search failed', error);
      return [];
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this._authState.set({ isAuthenticated: false, token: null, user: null });
    this._connectionState.set({ status: 'disconnected' });
    this._documents.set([]);
    this._isLoading.set(false);
    this.logger.info('NuxeoService', 'Service cleaned up');
  }

  // Utility methods
  private getAuthHeaders(): HttpHeaders {
    const authState = this._authState();
    return new HttpHeaders({
      'Authorization': `Basic ${authState.token}`,
      'Content-Type': NUXEO_CONSTANTS.API.HEADERS.CONTENT_TYPE,
      'X-NXProperties': NUXEO_CONSTANTS.API.HEADERS.NXPROPERTIES
    });
  }

  private validateConfig(config: INuxeoServiceConfig): boolean {
    const isValid = !!(config?.baseUrl && config?.timeout && config.timeout > 0);
    if (!isValid) {
      this.logger.warn('NuxeoService', 'Invalid configuration provided', config);
    }
    return isValid;
  }
}