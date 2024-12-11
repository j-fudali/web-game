import { Route } from '@angular/router';
import { AdminPanelComponent } from './admin-panel.component';
import { AddEncounterComponent } from './encounters/pages/add-encounter/add-encounter.component';
import { EncountersListComponent } from './encounters/pages/encounters-list/encounters-list.component';
import { EncounterDetailsComponent } from './encounters/pages/encounter-details/encounter-details.component';

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
        path: '',
        redirectTo: 'encounters',
        pathMatch: 'full',
      },
    ],
  },
] as Route[];
