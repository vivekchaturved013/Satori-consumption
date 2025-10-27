import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/nuxeo-dashboard/nuxeo-dashboard.component').then(m => m.NuxeoDashboardComponent)
  },
  {
    path: 'browse',
    loadComponent: () => import('./components/nuxeo-browser/nuxeo-browser.component').then(m => m.NuxeoBrowserComponent)
  },
  {
    path: 'browse/:path',
    loadComponent: () => import('./components/nuxeo-browser/nuxeo-browser.component').then(m => m.NuxeoBrowserComponent)
  }
];
