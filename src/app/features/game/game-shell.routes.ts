import { Route } from '@angular/router';
import { GameComponent } from './pages/game/game.component';
import { CreateCharacterComponent } from './pages/create-character/create-character.component';

export default [
  {
    path: '',
    component: GameComponent,
  },
  {
    path: 'create-character',
    component: CreateCharacterComponent,
  },
] as Route[];
