import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppWithSatoriHeaderComponent } from './app/components/app-with-satori-header/app-with-satori-header.component';

// Bootstrap the full Nuxeo Satori application with proper app header
bootstrapApplication(AppWithSatoriHeaderComponent, appConfig)
  .catch((err) => console.error('Bootstrap error:', err));
