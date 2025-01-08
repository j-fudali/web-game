import { Route } from '@angular/router';
import { EncounterComponent } from './encounter/encounter.component';
import { GamePanelComponent } from './game-panel/game-panel.component';
import { GameComponent } from './game.component';
import { isNeedRestGuard } from './guards/is-need-rest.guard';
import { isRestEndedGuard } from './guards/is-rest-ended.guard';

export default [
  {
    path: '',
    component: GameComponent,
    children: [
      {
        path: '',
        component: GamePanelComponent,
        canDeactivate: [isRestEndedGuard],
      },
      {
        path: 'play',
        component: EncounterComponent,
        canActivate: [isNeedRestGuard],
      },
    ],
  },
] as Route[];
