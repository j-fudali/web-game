import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoaderService } from './loader.service';
import { finalize, tap } from 'rxjs';

const EXCLUDED_REQUESTS = [
  '/player-character/equipped-items',
  '/player-character/rest',
  '/enemies',
];

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const url = req.url.split('api')[1];
  if (EXCLUDED_REQUESTS.find(r => url == r)) return next(req);
  const loader = inject(LoaderService);
  loader.show();
  return next(req).pipe(
    finalize(() => {
      loader.hide();
    })
  );
};
