import { CanActivateFn, Route, Router } from '@angular/router';
import { GamePanelComponent } from './pages/game-panel/game-panel.component';
import { CreateCharacterComponent } from './pages/create-character/create-character.component';
import { inject } from '@angular/core';
import { PlayerService } from '../../shared/services/player.service';
import { map } from 'rxjs';

const alreadyHasCharacter: CanActivateFn = (route, state) => {
  const playerService = inject(PlayerService);
  const router = inject(Router);
  return playerService.combinedPlayerCharacter$.pipe(
    map((pc) =>
      pc != undefined ? true : router.parseUrl('/game/create-character')
    )
  );
};
const hasNotAnyCharacter: CanActivateFn = (route, state) => {
  const playerService = inject(PlayerService);
  const router = inject(Router);
  return playerService.combinedPlayerCharacter$.pipe(
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
