import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { PlayerCharacterApiService } from '../api/player-character';
import { catchError, EMPTY, map, of, take } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

export const notHasCharacterGuard: CanActivateFn = (route, state) => {
  const playerService = inject(PlayerCharacterApiService);
  const router = inject(Router);
  return playerService.getPlayerCharacter().pipe(
    map(() => router.parseUrl('/game')),
    take(1),
    catchError((err: HttpErrorResponse) => {
      if (err.status == 404) return of(true);
      return EMPTY;
    })
  );
};
