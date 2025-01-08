import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './shared/interceptors/auth.interceptor';
import { errorHandlingInterceptor } from './shared/interceptors/error-handling.interceptor';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';
import { APP_CONFIG } from './shared/config';
import { environment } from '../environments/environment';
import { loaderInterceptor } from './shared/features/loader/loader.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([
        loaderInterceptor,
        authInterceptor,
        errorHandlingInterceptor,
      ])
    ),
    {
      provide: APP_CONFIG,
      useValue: environment,
    },
    {
      provide: DATE_PIPE_DEFAULT_OPTIONS,
      useValue: { dateFormat: 'dd.MM.yyyy hh:mm' },
    },
    MessageService,
    DialogService,
    ConfirmationService,
  ],
};
