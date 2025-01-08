import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CharacterComponent } from 'app/shared/components/character/character.component';
import { Enemy } from 'app/shared/interfaces/enemy';

@Component({
  selector: 'jfudali-enemy',
  standalone: true,
  imports: [CommonModule, CharacterComponent],
  template: `
    <jfudali-character
      [character]="enemy()"
      [showEnergy]="false"
      [orientation]="orientation()">
    </jfudali-character>
  `,
  styleUrl: './enemy.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnemyComponent {
  enemy = input.required<Enemy>();
  orientation = input.required<'horizontal' | 'vertical'>();
}
