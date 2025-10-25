import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';

import { NuxeoDashboardComponent, DashboardDocument } from './nuxeo-dashboard.component';
import { NuxeoService } from '../../../core/services/nuxeo.service';
import { LoggingService } from '../../../core/services/logging.service';

describe('NuxeoDashboardComponent', () => {
  let component: NuxeoDashboardComponent;
  let fixture: ComponentFixture<NuxeoDashboardComponent>;
  let mockNuxeoService: jasmine.SpyObj<NuxeoService>;
  let mockLoggingService: jasmine.SpyObj<LoggingService>;

  const mockDocuments: DashboardDocument[] = [
    {
      uid: 'doc-1',
      title: 'Test Document 1',
      type: 'File',
      lastModified: '2024-01-01T00:00:00Z',
      lastContributor: 'admin',
      contributorEmail: 'admin@nuxeo.com',
      path: '/default-domain/workspaces/test-doc-1',
      state: 'project',
      icon: 'file'
    },
    {
      uid: 'doc-2',
      title: 'Test Document 2',
      type: 'Folder',
      lastModified: '2024-01-02T00:00:00Z',
      lastContributor: 'user1',
      contributorEmail: 'user1@nuxeo.com',
      path: '/default-domain/workspaces/test-doc-2',
      state: 'project',
      icon: 'folder'
    }
  ];

  beforeEach(async () => {
    // Create spies for services
    mockNuxeoService = jasmine.createSpyObj('NuxeoService', [
      'getRecentlyEditedDocuments',
      'getRecentlyViewedDocuments',
      'getFavoriteDocuments'
    ]);
    
    mockLoggingService = jasmine.createSpyObj('LoggingService', [
      'info',
      'warn', 
      'error'
    ]);

    // Setup service method return values
    mockNuxeoService.getRecentlyEditedDocuments.and.returnValue(
      Promise.resolve({ entries: mockDocuments })
    );
    mockNuxeoService.getRecentlyViewedDocuments.and.returnValue(
      Promise.resolve({ entries: mockDocuments })
    );
    mockNuxeoService.getFavoriteDocuments.and.returnValue(
      Promise.resolve({ entries: mockDocuments })
    );

    await TestBed.configureTestingModule({
      imports: [
        NuxeoDashboardComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: NuxeoService, useValue: mockNuxeoService },
        { provide: LoggingService, useValue: mockLoggingService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NuxeoDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard data on init', async () => {
    spyOn(component, 'loadDashboardData' as any).and.returnValue(Promise.resolve());
    
    await component.ngOnInit();
    
    expect(component['loadDashboardData']).toHaveBeenCalled();
  });

  it('should return true when any section is loading', () => {
    // Access private signals through component instance
    (component as any)._isLoadingRecent.set(true);
    
    expect(component.isAnyLoading()).toBe(true);
  });

  it('should return false when no sections are loading', () => {
    // Ensure all loading states are false
    (component as any)._isLoadingRecent.set(false);
    (component as any)._isLoadingViewed.set(false);
    (component as any)._isLoadingFavorites.set(false);
    
    expect(component.isAnyLoading()).toBe(false);
  });

  it('should get correct document icon for different types', () => {
    expect(component.getDocumentIcon('File')).toBe('file');
    expect(component.getDocumentIcon('Folder')).toBe('folder');
    expect(component.getDocumentIcon('Collection')).toBe('bookmark');
    expect(component.getDocumentIcon('UnknownType')).toBe('file'); // default
  });

  it('should format time ago correctly', () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    expect(component.formatTimeAgo(oneHourAgo.toISOString())).toBe('1 hour ago');
    expect(component.formatTimeAgo(oneDayAgo.toISOString())).toBe('a day ago');
  });

  it('should get contributor initials correctly', () => {
    expect(component.getContributorInitials('John Doe')).toBe('JD');
    expect(component.getContributorInitials('admin')).toBe('A');
    expect(component.getContributorInitials('')).toBe('U');
  });

  it('should generate email from username', () => {
    expect(component['getEmailFromUsername']('administrator')).toBe('admin@nuxeo.com');
    expect(component['getEmailFromUsername']('testuser')).toBe('testuser@nuxeo.com');
  });

  it('should handle document click', () => {
    const document = mockDocuments[0];
    
    component.onDocumentClick(document);
    
    expect(mockLoggingService.info).toHaveBeenCalledWith(
      'NuxeoDashboardComponent',
      'Document clicked',
      { uid: document.uid, title: document.title }
    );
  });

  it('should render dashboard sections', () => {
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const sections = compiled.querySelectorAll('.dashboard-section');
    
    expect(sections.length).toBe(4); // Recently Edited, Tasks, Recently Viewed, Favorites
  });

  it('should show loading state', async () => {
    (component as any)._isLoadingRecent.set(true);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const loadingStates = compiled.querySelectorAll('.loading-state');
    
    expect(loadingStates.length).toBeGreaterThan(0);
  });

  it('should refresh all data when refresh button is clicked', async () => {
    spyOn(component, 'refreshAllData').and.returnValue(Promise.resolve());
    
    await component.refreshAllData();
    
    expect(component.refreshAllData).toHaveBeenCalled();
    expect(mockLoggingService.info).toHaveBeenCalledWith(
      'NuxeoDashboardComponent',
      'Refreshing all dashboard data'
    );
  });
});