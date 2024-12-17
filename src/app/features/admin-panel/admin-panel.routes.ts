import { Route } from '@angular/router';
import { AdminPanelComponent } from './admin-panel.component';
import { AddEncounterComponent } from './encounters/pages/add-encounter/add-encounter.component';
import { EncountersListComponent } from './encounters/pages/encounters-list/encounters-list.component';
import { EncounterDetailsComponent } from './encounters/pages/encounter-details/encounter-details.component';
import { AddEnemyComponent } from './enemies/pages/add-enemy/add-enemy.component';
import { EnemyDetailsComponent } from './enemies/pages/enemy-details/enemy-details.component';
import { EnemiesListComponent } from './enemies/pages/enemies-list/enemies-list.component';
import { AddItemComponent } from './items/pages/add-item/add-item.component';

export default [
  {
    path: '',
    component: AdminPanelComponent,
    children: [
      {
        path: 'encounters',
        children: [
          {
            path: 'add',
            component: AddEncounterComponent,
          },
          {
            path: ':id',
            component: EncounterDetailsComponent,
          },
          {
            path: '',
            component: EncountersListComponent,
          },
        ],
      },
      {
        path: 'enemies',
        children: [
          {
            path: 'add',
            component: AddEnemyComponent,
          },
          {
            path: ':id',
            component: EnemyDetailsComponent,
          },
          {
            path: '',
            component: EnemiesListComponent,
          },
        ],
      },
      {
        path: 'items',
        children: [
          {
            path: 'add',
            component: AddItemComponent,
          },
        ],
      },
      {
        path: '',
        redirectTo: 'encounters',
        pathMatch: 'full',
      },
    ],
  },
] as Route[];
