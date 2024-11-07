import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Item } from '../../interfaces/item';

@Component({
  selector: 'jfudali-item',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './item.component.html',
  styleUrl: './item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemComponent {
  item = input.required<Item>();
}
