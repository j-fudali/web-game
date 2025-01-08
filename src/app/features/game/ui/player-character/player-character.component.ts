import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PlayerCharacterDto } from '../../../../shared/api/player-character/model/player-character.dto';
import { CharacterComponent } from '../../../../shared/components/character/character.component';
import { CharacterClassTranslatePipe } from 'app/shared/pipes/character-class-translate.pipe';
import { TEXTS } from '../../texts/texts.const';

@Component({
  selector: 'jfudali-player-character',
  standalone: true,
  imports: [CommonModule, CharacterComponent, CharacterClassTranslatePipe],
  template: `
    <jfudali-character
      [character]="playerCharacter()"
      [showEnergy]="true"
      [orientation]="orientation()">
      <h3 class="m-0">{{ texts.PC_LEVEL }}: {{ playerCharacter().level }}</h3>
      <h4>
        {{ texts.PC_CLASS }}:
        {{ playerCharacter().characterClass | jfudaliCharacterClassTranslate }}
      </h4>
    </jfudali-character>
  `,
  styleUrl: './player-character.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerCharacterComponent {
  playerCharacter = input.required<PlayerCharacterDto>();
  orientation = input<'vertical' | 'horizontal'>('horizontal');
  readonly texts = TEXTS;
}
