import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AppWithSatoriHeaderComponent } from './app-with-satori-header.component';

describe('AppWithSatoriHeaderComponent', () => {
  let component: AppWithSatoriHeaderComponent;
  let fixture: ComponentFixture<AppWithSatoriHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppWithSatoriHeaderComponent,
        RouterTestingModule,
        NoopAnimationsModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppWithSatoriHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct title', () => {
    expect(component.title).toBe('Nuxeo ECM System');
  });

  it('should render title in template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Nuxeo ECM System');
  });

  it('should render navigation items', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const navItems = compiled.querySelectorAll('sat-platform-nav-list-item');
    expect(navItems.length).toBe(5); // Dashboard, Documents, Search, Workflows, Administration
  });

  it('should render header actions', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const actionButtons = compiled.querySelectorAll('.header-action-btn');
    expect(actionButtons.length).toBe(2); // Notifications and Profile buttons
  });
});