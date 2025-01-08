import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { catchError, EMPTY, map, of, take } from 'rxjs';
import { PlayerCharacterApiService } from '../api/player-character';

export const hasCharacterGuard: CanActivateFn = (route, state) => {
  const playerService = inject(PlayerCharacterApiService);
  const router = inject(Router);
  return playerService.getPlayerCharacter().pipe(
    take(1),
    map(() => true),
    catchError((err: HttpErrorResponse) => {
      if (err.status == 404) {
        return of(router.parseUrl('/create-character'));
      }
      return EMPTY;
    })
  );
};
