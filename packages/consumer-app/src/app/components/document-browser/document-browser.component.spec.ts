import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { DocumentBrowserComponent } from './document-browser.component';
import { NuxeoService } from '../../../core/services/nuxeo.service';
import { LoggingService } from '../../../core/services/logging.service';
import { DashboardDocument } from '../nuxeo-dashboard/nuxeo-dashboard.component';

describe('DocumentBrowserComponent', () => {
  let component: DocumentBrowserComponent;
  let fixture: ComponentFixture<DocumentBrowserComponent>;
  let mockNuxeoService: jasmine.SpyObj<NuxeoService>;
  let mockLoggingService: jasmine.SpyObj<LoggingService>;

  const mockDocument: DashboardDocument = {
    uid: 'test-uid',
    title: 'Test Document',
    type: 'Picture',
    lastModified: '2025-10-15T10:00:00Z',
    lastContributor: 'Test User',
    contributorEmail: 'test@example.com',
    path: '/default-domain/workspaces/test/document',
    state: 'project',
    icon: 'image'
  };

  beforeEach(async () => {
    const nuxeoServiceSpy = jasmine.createSpyObj('NuxeoService', [
      'getDocumentByPath'
    ]);
    const loggingServiceSpy = jasmine.createSpyObj('LoggingService', [
      'info',
      'error',
      'warn'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        DocumentBrowserComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: NuxeoService, useValue: nuxeoServiceSpy },
        { provide: LoggingService, useValue: loggingServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentBrowserComponent);
    component = fixture.componentInstance;
    mockNuxeoService = TestBed.inject(NuxeoService) as jasmine.SpyObj<NuxeoService>;
    mockLoggingService = TestBed.inject(LoggingService) as jasmine.SpyObj<LoggingService>;

    // Set up the document input
    component.document = mockDocument;
    component.isVisible = true;

    // Mock the API response
    mockNuxeoService.getDocumentByPath.and.returnValue(
      Promise.resolve({
        uid: mockDocument.uid,
        title: mockDocument.title,
        path: mockDocument.path,
        type: mockDocument.type,
        state: mockDocument.state,
        properties: {
          'dc:creator': 'Test Creator',
          'dc:created': '2025-10-01T10:00:00Z',
          'dc:modified': mockDocument.lastModified,
          'dc:lastContributor': mockDocument.lastContributor,
          'dc:description': 'Test description'
        },
        contextParameters: {
          tags: ['test', 'document'],
          collections: ['Test Collection']
        },
        versionLabel: '1.0'
      })
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize tree data on init', () => {
    component.ngOnInit();
    
    const treeNodes = component.treeNodes();
    expect(treeNodes).toBeDefined();
    expect(treeNodes.length).toBeGreaterThan(0);
    expect(treeNodes[0].name).toBe('Root');
  });

  it('should load document details on init', async () => {
    await component.ngOnInit();
    fixture.detectChanges();
    
    expect(mockNuxeoService.getDocumentByPath).toHaveBeenCalledWith(mockDocument.path);
    expect(mockLoggingService.info).toHaveBeenCalled();
  });

  it('should emit close event when onClose is called', () => {
    spyOn(component.closeRequested, 'emit');
    
    component.onClose();
    
    expect(component.closeRequested.emit).toHaveBeenCalled();
  });

  it('should handle tab changes', () => {
    component.onTabChanged(1);
    
    expect(component.selectedTab()).toBe(1);
    expect(mockLoggingService.info).toHaveBeenCalledWith(
      'DocumentBrowser',
      'Tab changed',
      { tabIndex: 1 }
    );
  });

  it('should handle tree node clicks', () => {
    const mockNode = {
      name: 'Test Node',
      path: '/test',
      type: 'folder' as const,
      expanded: false
    };
    
    component.onTreeNodeClick(mockNode);
    
    expect(mockNode.expanded).toBe(true);
    expect(mockLoggingService.info).toHaveBeenCalledWith(
      'DocumentBrowser',
      'Tree node clicked',
      { node: mockNode.name, path: mockNode.path }
    );
  });

  it('should format file size correctly', () => {
    expect(component.formatFileSize(undefined)).toBe('Unknown');
    expect(component.formatFileSize(0)).toBe('0 Bytes');
    expect(component.formatFileSize(1024)).toBe('1 KB');
    expect(component.formatFileSize(1048576)).toBe('1 MB');
  });

  it('should format date correctly', () => {
    expect(component.formatDate('Invalid Date')).toBe('Unknown');
    expect(component.formatDate('')).toBe('Unknown');
    
    const validDate = '2025-10-15T10:00:00Z';
    const formatted = component.formatDate(validDate);
    expect(formatted).not.toBe('Unknown');
    expect(formatted).toContain('2025');
  });

  it('should return correct document icon', () => {
    expect(component.getDocumentIcon('Picture')).toBe('image');
    expect(component.getDocumentIcon('File')).toBe('description');
    expect(component.getDocumentIcon('Folder')).toBe('folder');
    expect(component.getDocumentIcon('Unknown')).toBe('description');
  });

  it('should handle comment addition', () => {
    component.comment.set('Test comment');
    
    component.onAddComment();
    
    expect(component.comment()).toBe('');
    expect(mockLoggingService.info).toHaveBeenCalledWith(
      'DocumentBrowser',
      'Adding comment',
      { comment: 'Test comment' }
    );
  });

  it('should handle download action', () => {
    // Set up document details first
    component.documentDetails.set({
      uid: mockDocument.uid,
      title: mockDocument.title,
      path: mockDocument.path,
      type: mockDocument.type,
      state: mockDocument.state,
      creator: 'Test Creator',
      created: '2025-10-01T10:00:00Z',
      lastModified: mockDocument.lastModified,
      lastContributor: mockDocument.lastContributor
    });
    
    component.onDownload();
    
    expect(mockLoggingService.info).toHaveBeenCalledWith(
      'DocumentBrowser',
      'Download requested',
      { uid: mockDocument.uid }
    );
  });

  it('should generate breadcrumb items correctly', () => {
    component.documentDetails.set({
      uid: mockDocument.uid,
      title: mockDocument.title,
      path: '/default-domain/workspaces/test/document',
      type: mockDocument.type,
      state: mockDocument.state,
      creator: 'Test Creator',
      created: '2025-10-01T10:00:00Z',
      lastModified: mockDocument.lastModified,
      lastContributor: mockDocument.lastContributor
    });
    
    const breadcrumbs = component.breadcrumbItems();
    
    expect(breadcrumbs.length).toBeGreaterThan(2);
    expect(breadcrumbs[0].label).toBe('Home');
    expect(breadcrumbs[1].label).toBe('Browse');
  });
});