import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { ItemsService } from '../../shared/services/items.service';

@Component({
  selector: 'jfudali-game',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent implements OnInit {
  private _itemsService = inject(ItemsService);
  ngOnInit(): void {
    this._itemsService.getOwnedItems$.next();
  }
}
