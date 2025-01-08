import { inject } from '@angular/core';
import { Router, type ResolveFn } from '@angular/router';
import {
  PlayerCharacterApiResponse,
  PlayerCharacterApiService,
  PlayerCharacterDto,
} from '../api/player-character';
import { map } from 'rxjs';
import { PlayerCharacterMapper } from 'app/features/game/utils/player-character.mapper';

export const getPlayerCharacterResolver: ResolveFn<PlayerCharacterDto> = (
  route,
  state
) => {
  const playerCharacterApiService = inject(PlayerCharacterApiService);
  return playerCharacterApiService
    .getPlayerCharacter()
    .pipe(map(pc => PlayerCharacterMapper.toPlayerCharacterDto(pc)));
};
