import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PlayerCharacter } from '../../../../shared/interfaces/player-character';
import { CharacterComponent } from '../../../../shared/components/character/character.component';

@Component({
  selector: 'jfudali-player-character',
  standalone: true,
  imports: [CommonModule, CharacterComponent],
  template: `
    <jfudali-character
      [character]="playerCharacter()"
      [showEnergy]="true"
      [orientation]="orientation()"
    >
      <h4>Klasa: {{ playerCharacter().characterClass.name }}</h4>
    </jfudali-character>
  `,
  styleUrl: './player-character.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerCharacterComponent {
  playerCharacter = input.required<PlayerCharacter>();
  orientation = input<'vertical' | 'horizontal'>('horizontal');
}
