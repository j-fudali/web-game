import { InjectionToken } from '@angular/core';
import { Environment } from './interfaces/environment.interface';

export const APP_CONFIG = new InjectionToken<Environment>('Application config');
