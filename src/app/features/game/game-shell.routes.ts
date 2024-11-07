import { CanActivateFn, Route, Router } from '@angular/router';
import { GamePanelComponent } from './pages/game-panel/game-panel.component';
import { CreateCharacterComponent } from './pages/create-character/create-character.component';
import { inject } from '@angular/core';
import { combineLatest, filter, map } from 'rxjs';
import { PlayerCharacterService } from '../../shared/services/player-character.service';
import { EncounterComponent } from './pages/encounter/encounter.component';
import { toObservable } from '@angular/core/rxjs-interop';
import { GameComponent } from './game.component';
import { EquipmentService } from '../../shared/services/equipment.service';

const alreadyHasCharacter: CanActivateFn = (route, state) => {
  const playerService = inject(PlayerCharacterService);
  const router = inject(Router);
  return toObservable(playerService.state.playerCharacter).pipe(
    filter(pc => pc !== undefined),
    map(pc => (pc != null ? true : router.parseUrl('/game/create-character')))
  );
};
const hasNotAnyCharacter: CanActivateFn = (route, state) => {
  const playerService = inject(PlayerCharacterService);
  const router = inject(Router);
  return toObservable(playerService.state.playerCharacter).pipe(
    filter(pc => pc !== undefined),
    map(pc => (pc == null ? true : router.parseUrl('/')))
  );
};

export default [
  {
    path: '',
    component: GameComponent,
    providers: [EquipmentService],
    children: [
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
        // canActivate: [hasEnoughHealthAndEnergy],
      },
    ],
  },
] as Route[];
