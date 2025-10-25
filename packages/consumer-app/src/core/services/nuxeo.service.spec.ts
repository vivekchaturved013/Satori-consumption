import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NuxeoService } from './nuxeo.service';
import { LoggingService } from './logging.service';
import { NUXEO_CONSTANTS } from '../constants/nuxeo.constants';

describe('NuxeoService', () => {
  let service: NuxeoService;
  let httpMock: HttpTestingController;
  let mockLoggingService: jasmine.SpyObj<LoggingService>;

  beforeEach(() => {
    const logSpy = jasmine.createSpyObj('LoggingService', ['info', 'error', 'warn', 'debug']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        NuxeoService,
        { provide: LoggingService, useValue: logSpy }
      ]
    });

    service = TestBed.inject(NuxeoService);
    httpMock = TestBed.inject(HttpTestingController);
    mockLoggingService = TestBed.inject(LoggingService) as jasmine.SpyObj<LoggingService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize successfully with valid config', async () => {
    const config = { 
      baseUrl: 'http://test.com/nuxeo',
      apiPath: '/api/v1', 
      timeout: 5000 
    };
    
    // Mock the health check request
    const initPromise = service.initialize(config);
    
    const req = httpMock.expectOne(`${config.baseUrl}${NUXEO_CONSTANTS.API.ENDPOINTS.HEALTH}`);
    expect(req.request.method).toBe('GET');
    req.flush({ status: 'ok' }); // Mock successful response
    
    const result = await initPromise;
    
    expect(result).toBe(true);
    expect(mockLoggingService.info).toHaveBeenCalledWith('NuxeoService', 'Service initialized successfully');
  });

  it('should handle initialization errors', async () => {
    const invalidConfig = { 
      baseUrl: '', 
      apiPath: '/api/v1',
      timeout: 0 
    };
    
    await expectAsync(service.initialize(invalidConfig)).toBeRejectedWithError('Invalid configuration provided');
    expect(mockLoggingService.error).toHaveBeenCalled();
  });

  it('should test connection successfully', async () => {
    const config = { 
      baseUrl: 'http://test.com/nuxeo',
      apiPath: '/api/v1',
      timeout: 5000 
    };
    
    const testPromise = service.testConnection(config);
    
    const req = httpMock.expectOne(`${config.baseUrl}${NUXEO_CONSTANTS.API.ENDPOINTS.HEALTH}`);
    expect(req.request.method).toBe('GET');
    req.flush({ status: 'running' });
    
    const result = await testPromise;
    
    expect(result).toBe(true);
    expect(service.getConnectionStatus()).toBe('connected');
  });

  it('should handle connection test failures', async () => {
    const config = { 
      baseUrl: 'http://test.com/nuxeo',
      apiPath: '/api/v1',
      timeout: 5000 
    };
    
    const testPromise = service.testConnection(config);
    
    const req = httpMock.expectOne(`${config.baseUrl}${NUXEO_CONSTANTS.API.ENDPOINTS.HEALTH}`);
    req.error(new ErrorEvent('Network error'));
    
    const result = await testPromise;
    
    expect(result).toBe(false);
    expect(service.getConnectionStatus()).toBe('disconnected');
  });

  it('should authenticate user successfully', async () => {
    const username = 'testuser';
    const password = 'testpass';
    const config = service.currentConfig;
    
    const authPromise = service.authenticate(username, password);
    
    const req = httpMock.expectOne(`${config.baseUrl}${config.apiPath}${NUXEO_CONSTANTS.API.ENDPOINTS.AUTOMATION}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toContain('Basic');
    req.flush({ success: true });
    
    const result = await authPromise;
    
    expect(result).toBe(true);
    expect(service.isAuthenticated).toBe(true);
  });

  it('should get CMIS permissions', async () => {
    const mockPermissions = {
      permissions: [
        { key: 'canAddPolicy.Object', permission: ['cmis:write'] },
        { key: 'canAddPolicy.Policy', permission: ['cmis:write'] }
      ]
    };
    
    // Set up authentication first
    service['_authState'].set({
      isAuthenticated: true,
      token: 'dGVzdDp0ZXN0', // base64 encoded test:test
      user: null
    });
    
    const permissionsPromise = service.getCmisPermissions();
    
    const config = service.currentConfig;
    const req = httpMock.expectOne(`${config.baseUrl}${NUXEO_CONSTANTS.API.ENDPOINTS.JSON_CMIS}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toContain('Basic');
    req.flush(mockPermissions);
    
    const result = await permissionsPromise;
    
    expect(result).toEqual(mockPermissions);
    expect(mockLoggingService.info).toHaveBeenCalledWith('NuxeoService', 'CMIS permissions retrieved successfully');
  });

  it('should get children documents', async () => {
    const mockResponse = {
      entries: [
        {
          uid: 'doc1',
          path: '/default-domain/test',
          type: 'File',
          title: 'Test Document',
          state: 'project',
          created: '2023-01-01',
          modified: '2023-01-02',
          author: 'admin',
          properties: {},
          facets: []
        }
      ],
      totalSize: 1,
      pageSize: 20,
      currentPageIndex: 0
    };
    
    // Set up authentication
    service['_authState'].set({
      isAuthenticated: true,
      token: 'dGVzdDp0ZXN0',
      user: null
    });
    
    const path = '/default-domain';
    const childrenPromise = service.getChildren(path);
    
    const config = service.currentConfig;
    const req = httpMock.expectOne(`${config.baseUrl}${config.apiPath}${NUXEO_CONSTANTS.API.ENDPOINTS.DOCUMENTS}${path}/@children`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
    
    const result = await childrenPromise;
    
    expect(result).toEqual(mockResponse.entries);
    expect(service.documents().length).toBe(1);
  });

  it('should cleanup resources', () => {
    service.cleanup();
    
    expect(service.isAuthenticated).toBe(false);
    expect(service.getConnectionStatus()).toBe('disconnected');
    expect(service.documents().length).toBe(0);
    expect(service.isLoading()).toBe(false);
  });
});