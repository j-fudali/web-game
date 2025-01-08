import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnChanges,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { RoundsComponent } from './ui/rounds/rounds.component';
import { EnemyComponent } from './ui/enemy/enemy.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { FightDto } from 'app/shared/api/fight';
import { RandomEncounterEnemyDto } from 'app/shared/api/encounters';
import { EncounterDetailsComponent } from 'app/features/game/ui/encounter-details/encounter-details.component';
import { Enemy } from 'app/shared/interfaces/enemy';
import { OwnedItem } from 'app/shared/interfaces/owned-item';
import { EnemyMapper } from '../../utils/enemy-mapper';
import { TEXTS } from 'app/features/game/texts/texts.const';

@Component({
  selector: 'jfudali-fight',
  standalone: true,
  imports: [
    CommonModule,
    RoundsComponent,
    EnemyComponent,
    ProgressSpinnerModule,
    EncounterDetailsComponent,
    ButtonModule,
  ],
  templateUrl: './fight.component.html',
  styleUrl: './fight.component.scss',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FightComponent implements OnChanges {
  dealDamagePlayerCharacter = output<number>();
  loadEncounter = output<void>();
  simulateFight = output<void>();
  skip = output<number>();
  onFightEnd = output<boolean>();

  title = input.required<string>();
  description = input.required<string>();
  fight = input.required<FightDto | undefined>();
  randomEncounterEnemy = input.required<RandomEncounterEnemyDto>();
  playerCharacterName = input.required<string>();
  playerCharacterEquippedWeapon = input<OwnedItem>();
  enemy = signal<Enemy>({} as Enemy);
  readonly texts = TEXTS;
  ngOnChanges(): void {
    this.enemy.set(
      EnemyMapper.mapEncounterEnemyDtoToEnemy(this.randomEncounterEnemy())
    );
  }
  fightEnd() {
    const fight = this.fight();
    if (fight) this.onFightEnd.emit(fight.userLevelUp);
  }
}
