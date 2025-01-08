import { inject } from '@angular/core';
import { type CanActivateFn } from '@angular/router';
import { switchMap, of, map, take, merge, filter } from 'rxjs';
import { PlayerCharacterApiService } from 'app/shared/api/player-character';
import { PlayerCharacterService } from '../services/player-character.service';
import { PlayerCharacterMapper } from '../utils/player-character.mapper';

export const isNeedRestGuard: CanActivateFn = (route, state) => {
  const playerCharacterService = inject(PlayerCharacterService);
  const playerCharacterApiService = inject(PlayerCharacterApiService);

  return merge(
    playerCharacterService
      .getPlayerCharacter$()
      .pipe(filter(pc => Object.keys(pc).length > 0)),
    playerCharacterApiService
      .getPlayerCharacter()
      .pipe(map(res => PlayerCharacterMapper.toPlayerCharacterDto(res)))
  ).pipe(
    switchMap(pc => {
      if (playerCharacterService.checkIfRestIsNeed(pc)) {
        playerCharacterService.forceRest();
        return of(false);
      }
      return of(true);
    }),
    take(1)
  );
};
