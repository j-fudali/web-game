import { Route } from '@angular/router';
import { AdminPanelComponent } from './admin-panel.component';
import { EncountersListComponent } from './pages/encounters-list/encounters-list.component';
import { AddEncounterComponent } from './pages/add-encounter/add-encounter.component';

export default [
  {
    path: '',
    component: AdminPanelComponent,
    children: [
      {
        path: 'encounters',
        children: [
          {
            path: '',
            component: EncountersListComponent,
          },
          {
            path: 'add',
            component: AddEncounterComponent,
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
