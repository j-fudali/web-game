import { CanActivateFn, Route, Router } from '@angular/router';
import { GamePanelComponent } from './pages/game-panel/game-panel.component';
import { CreateCharacterComponent } from './pages/create-character/create-character.component';
import { inject } from '@angular/core';
import { map, tap } from 'rxjs';
import { PlayerCharacterService } from '../../shared/services/player-character.service';

const alreadyHasCharacter: CanActivateFn = (route, state) => {
  const playerService = inject(PlayerCharacterService);
  const router = inject(Router);
  return playerService.playerCharacter$.pipe(
    map((pc) =>
      pc != undefined ? true : router.parseUrl('/game/create-character')
    )
  );
};
const hasNotAnyCharacter: CanActivateFn = (route, state) => {
  const playerService = inject(PlayerCharacterService);
  const router = inject(Router);
  return playerService.playerCharacter$.pipe(
    map((pc) => (pc == undefined ? true : router.parseUrl('/')))
  );
};

export default [
  {
    path: '',
    component: GamePanelComponent,
    canActivate: [alreadyHasCharacter],
  },
  {
    path: 'create-character',
    component: CreateCharacterComponent,
    canActivate: [hasNotAnyCharacter],
  },
] as Route[];
