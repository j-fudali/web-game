import { Route } from '@angular/router';
import { MarketplaceComponent } from './pages/marketplace/marketplace.component';
import { BuyLootboxesComponent } from '../lootboxes/lootboxes/buy-lootboxes.component';

export default [
  {
    path: '',
    component: MarketplaceComponent,
  },
] as Route[];
