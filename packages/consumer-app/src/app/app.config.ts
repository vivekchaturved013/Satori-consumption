import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

// Import Satori providers
import { provideAndConfigureSatoriUITranslations } from '@hylandsoftware/satori-ui/translations';
import { provideSatoriTheme } from '@hylandsoftware/satori-ui/providers';
import { provideSatoriLayout } from '@hylandsoftware/satori-layout';
import { provideApplicationCore, providePlugin } from '@hylandsoftware/satori-devkit';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
    
    // Configure Satori UI core providers
    provideSatoriTheme(),
    
    // Configure Satori Application Core with minimal descriptor
    provideApplicationCore({
      applicationTitle: 'Nuxeo Satori Integration App'
    }),
    
    // Configure Satori UI with translations
    provideAndConfigureSatoriUITranslations({}),
    
    // Configure Satori Layout
    provideSatoriLayout()
  ]
};
