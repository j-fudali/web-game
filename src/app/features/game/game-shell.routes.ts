import { CanActivateFn, Route, Router } from '@angular/router';
import { GamePanelComponent } from './pages/game-panel/game-panel.component';
import { CreateCharacterComponent } from './pages/create-character/create-character.component';
import { inject } from '@angular/core';
import { filter, map, take, tap } from 'rxjs';
import { PlayerCharacterService } from '../../shared/services/player-character.service';
import { EncounterComponent } from './pages/encounter/encounter.component';
import { toObservable } from '@angular/core/rxjs-interop';

const alreadyHasCharacter: CanActivateFn = (route, state) => {
  const playerService = inject(PlayerCharacterService);
  const router = inject(Router);
  return toObservable(playerService.state.playerCharacter).pipe(
    filter((pc) => pc !== undefined),
    map((pc) =>
      pc != undefined ? true : router.parseUrl('/game/create-character')
    )
  );
};
const hasNotAnyCharacter: CanActivateFn = (route, state) => {
  const playerService = inject(PlayerCharacterService);
  const router = inject(Router);
  return toObservable(playerService.state.playerCharacter).pipe(
    filter((pc) => pc !== undefined),
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
  {
    path: 'play',
    component: EncounterComponent,
  },
] as Route[];
