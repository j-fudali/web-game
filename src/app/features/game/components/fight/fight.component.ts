import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { RoundsComponent } from '../rounds/rounds.component';
import { EnemyComponent } from '../enemy/enemy.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { OwnedItem } from '../../../../shared/interfaces/owned-item';
import { Fight } from '../../../../shared/interfaces/fight';
import { Enemy } from '../../../../shared/interfaces/enemy';
import { EncounterDetailsComponent } from '../encounter-details/encounter-details.component';
import { EncounterOnDraw } from '../../../../shared/interfaces/encounter';
import { ButtonModule } from 'primeng/button';

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
export class FightComponent {
  dealDamageEnemy = output<number>();
  dealDamagePlayerCharacter = output<number>();
  loadEncounter = output<void>();
  simulateFight = output<void>();
  skip = output<{ pcDamage: number; enemyDamage: number }>();

  title = input.required<string>();
  description = input.required<string>();
  fight = input.required<Fight>();
  enemy = input.required<Enemy>();
  status = input.required<string | undefined>();
  playerCharacterName = input.required<string>();
  playerCharacterEquippedWeapon = input.required<OwnedItem>();
}
