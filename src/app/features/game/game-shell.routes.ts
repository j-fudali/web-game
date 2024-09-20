import { CanActivateFn, Route, Router } from '@angular/router';
import { GamePanelComponent } from './pages/game-panel/game-panel.component';
import { CreateCharacterComponent } from './pages/create-character/create-character.component';
import { inject } from '@angular/core';
import { filter, map, take, tap } from 'rxjs';
import { PlayerCharacterService } from '../../shared/services/player-character.service';
import { EncounterComponent } from './pages/encounter/encounter.component';
import { toObservable } from '@angular/core/rxjs-interop';
import { PlayerCharacter } from '../../shared/interfaces/player-character';
import { DialogService } from 'primeng/dynamicdialog';
import { GetRestDialogComponent } from './components/get-rest-dialog/get-rest-dialog.component';

const alreadyHasCharacter: CanActivateFn = (route, state) => {
  const playerService = inject(PlayerCharacterService);
  const router = inject(Router);
  return toObservable(playerService.state.playerCharacter).pipe(
    filter((pc) => pc !== undefined),
    map((pc) =>
      pc != null ? true : router.parseUrl('/game/create-character')
    )
  );
};
const hasNotAnyCharacter: CanActivateFn = (route, state) => {
  const playerService = inject(PlayerCharacterService);
  const router = inject(Router);
  return toObservable(playerService.state.playerCharacter).pipe(
    filter((pc) => pc !== undefined),
    map((pc) => pc == null ? true : router.parseUrl('/'))
  );
};
const hasEnoughHealthPoints: CanActivateFn = (route,state) => {
  const playerService = inject(PlayerCharacterService);
  const router = inject(Router);
  const dialog = inject(DialogService)
  return toObservable(playerService.state.playerCharacter).pipe(
    filter(pc => pc !== undefined && pc !== null),
    map(pc => {
      if((pc as PlayerCharacter).statistics.health.actualValue > 0){
        return true
      }
      const ref = dialog.open(GetRestDialogComponent, {header: 'Odpocznij'})
      ref.onClose.subscribe((rest) => {
        if(rest) playerService.rest$.next()
      })
      return router.parseUrl('/')}
    )
  )
}
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
    canActivate: [hasEnoughHealthPoints]
  },
] as Route[];
