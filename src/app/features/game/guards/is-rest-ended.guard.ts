import { inject } from '@angular/core';
import { type CanDeactivateFn } from '@angular/router';
import { GamePanelComponent } from '../game-panel/game-panel.component';
import { PlayerCharacterService } from '../services/player-character.service';
import { filter, map } from 'rxjs';

export const isRestEndedGuard: CanDeactivateFn<GamePanelComponent> = (
  component,
  currentRoute,
  currentState,
  nextState
) => {
  const playerCharacterService = inject(PlayerCharacterService);
  if (playerCharacterService.getIsResting()) {
    playerCharacterService.stopRest();
  } else {
    return true;
  }
  return playerCharacterService.getIsResting$().pipe(
    filter(rest => !rest),
    map(() => true)
  );
};
