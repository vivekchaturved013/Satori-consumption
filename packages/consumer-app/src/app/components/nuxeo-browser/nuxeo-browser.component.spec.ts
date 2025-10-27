import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { NuxeoBrowserComponent } from './nuxeo-browser.component';
import { NuxeoService } from '../../../core/services/nuxeo.service';
import { LoggingService } from '../../../core/services/logging.service';

describe('NuxeoBrowserComponent', () => {
  let component: NuxeoBrowserComponent;
  let fixture: ComponentFixture<NuxeoBrowserComponent>;
  let mockNuxeoService: jasmine.SpyObj<NuxeoService>;
  let mockLoggingService: jasmine.SpyObj<LoggingService>;

  beforeEach(async () => {
    const nuxeoServiceSpy = jasmine.createSpyObj('NuxeoService', [
      'getRecentlyEditedDocuments'
    ]);
    const loggingServiceSpy = jasmine.createSpyObj('LoggingService', [
      'info',
      'error',
      'warn'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        NuxeoBrowserComponent,
        NoopAnimationsModule,
        RouterTestingModule
      ],
      providers: [
        { provide: NuxeoService, useValue: nuxeoServiceSpy },
        { provide: LoggingService, useValue: loggingServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NuxeoBrowserComponent);
    component = fixture.componentInstance;
    mockNuxeoService = TestBed.inject(NuxeoService) as jasmine.SpyObj<NuxeoService>;
    mockLoggingService = TestBed.inject(LoggingService) as jasmine.SpyObj<LoggingService>;

    // Mock the API response
    mockNuxeoService.getRecentlyEditedDocuments.and.returnValue(
      Promise.resolve({
        entries: [
          {
            uid: 'test-uid-1',
            title: 'Test Document 1',
            path: '/default-domain/workspaces/test/doc1',
            type: 'File',
            state: 'project',
            properties: {
              'dc:creator': 'Test Creator',
              'dc:created': '2025-10-01T10:00:00Z',
              'dc:modified': '2025-10-15T10:00:00Z',
              'dc:lastContributor': 'Test Contributor'
            }
          }
        ]
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

  it('should load documents on init', async () => {
    await component.ngOnInit();
    fixture.detectChanges();
    
    expect(mockNuxeoService.getRecentlyEditedDocuments).toHaveBeenCalled();
    expect(mockLoggingService.info).toHaveBeenCalled();
  });

  it('should handle tab changes', () => {
    component.onTabChanged(1);
    
    expect(component.selectedTab()).toBe(1);
    expect(mockLoggingService.info).toHaveBeenCalledWith(
      'NuxeoBrowser',
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
      'NuxeoBrowser',
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
      'NuxeoBrowser',
      'Adding comment',
      { comment: 'Test comment' }
    );
  });

  it('should generate breadcrumb items correctly', () => {
    component.currentPath.set('/default-domain/workspaces/test');
    
    const breadcrumbs = component.breadcrumbItems();
    
    expect(breadcrumbs.length).toBeGreaterThan(2);
    expect(breadcrumbs[0].label).toBe('Home');
    expect(breadcrumbs[1].label).toBe('Browse');
  });

  it('should get creator initials correctly', () => {
    expect(component.getCreatorInitials('John Doe')).toBe('JD');
    expect(component.getCreatorInitials('Administrator')).toBe('AD');
    expect(component.getCreatorInitials('Unknown')).toBe('UN');
    expect(component.getCreatorInitials('')).toBe('UN');
  });
});