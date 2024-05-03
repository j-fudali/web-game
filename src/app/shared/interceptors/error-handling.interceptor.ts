import type {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

export const errorHandlingInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status == 500) {
        messageService.add({
          severity: 'error',
          summary: 'Błąd',
          detail: 'Coś poszło nie tak spróbuj ponownie później',
        });
      }
      return throwError(() => err);
    })
  );
};
