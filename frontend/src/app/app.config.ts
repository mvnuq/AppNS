import { DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { serviceResultInterceptor } from './core/interceptors/service-result.interceptor';

/** Zona horaria de negocio para DatePipe (coincide con la API). */
const chileTimezone = 'America/Santiago';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptors([serviceResultInterceptor])),
    {
      provide: DATE_PIPE_DEFAULT_OPTIONS,
      useValue: { timezone: chileTimezone },
    },
  ],
};
