import { Route } from '@angular/router';
import { BuyLootboxesComponent } from './lootboxes/buy-lootboxes.component';
import { OpenLootboxComponent } from './open-lootbox/open-lootbox.component';

export default [
  { path: '', component: BuyLootboxesComponent },
  {
    path: 'my-lootboxes',
    component: OpenLootboxComponent,
  },
] as Route[];
