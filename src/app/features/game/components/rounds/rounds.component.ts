import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
} from '@angular/core';
import { Fight } from '../../../../shared/interfaces/fight';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Subject,
  map,
  merge,
  interval,
  takeWhile,
  takeUntil,
  tap,
  startWith,
  timer,
} from 'rxjs';
import { Enemy } from '../../../../shared/interfaces/enemy';
import { Item } from '../../../../shared/interfaces/item';
import { trigger, transition, style, animate } from '@angular/animations';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessagesModule } from 'primeng/messages';

@Component({
  selector: 'jfudali-rounds',
  standalone: true,
  imports: [
    CommonModule,
    MessagesModule,
    NgOptimizedImage,
    ButtonModule,
    CardModule,
  ],
  templateUrl: './rounds.component.html',
  styleUrl: './rounds.component.scss',
  animations: [
    trigger('roundAnim', [
      transition(':enter', [
        style({
          opacity: 0,
        }),
        animate('1s ease-out', style({ opacity: 1 })),
        animate('3s', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('2s', style({ opacity: 1 })),
        animate('1s ease-in', style({ opacity: 0 })),
      ]),
    ]),
    trigger('showResult', [
      transition(':enter', [
        style({
          transform: 'translateY(100%)',
        }),
        animate('200ms ease-out', style({ transform: 'translateY(0)' })),
      ]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoundsComponent {
  dealDamageEnemy = output<number>();
  dealDamagePlayerCharacter = output<number>();
  onLoadEncounter = output<void>();
  onSkip = output<{ pcDamage: number; enemyDamage: number }>();

  fight = input.required<Fight>();
  playerCharacterWeapon = input.required<Item>();
  playerCharacterName = input.required<string>();
  enemy = input.required<Enemy>();

  rounds = computed(() => this.fight().rounds);
  winner = computed(() =>
    this.fight().userWon ? this.playerCharacterName() : this.enemy().name
  );
  enemyWeapon = computed(() => this.enemy().weapon);

  private skipToLast$ = new Subject<void>();
  private onSkipToLast$ = this.skipToLast$.pipe(
    map(() => this.rounds().length)
  );
  currentIndex = toSignal(
    merge(
      interval(4000).pipe(
        map((v) => v + 1),
        takeWhile((val) => val <= this.rounds().length),
        takeUntil(this.onSkipToLast$)
      ),
      this.onSkipToLast$
    ),
    { initialValue: 0 }
  );
  constructor() {
    effect(() => {
      if (this.currentIndex() < this.rounds().length) {
        const round = this.rounds()[this.currentIndex()];
        if (round.enemyHitPointsValue > round.playerHitPointsValue) {
          this.dealDamagePlayerCharacter.emit(round.dealtDamage);
        } else if (round.playerHitPointsValue > round.enemyHitPointsValue) {
          this.dealDamageEnemy.emit(round.dealtDamage);
        }
      }
    });
  }
  skip() {
    const pcDamage = this.calculateRestOfDamage('player-character');
    const enemyDamage = this.calculateRestOfDamage('enemy');
    this.skipToLast$.next();
    this.onSkip.emit({ pcDamage, enemyDamage });
  }
  private calculateRestOfDamage(character: 'player-character' | 'enemy') {
    return this.rounds()
      .slice(this.currentIndex() + 1)
      .filter(({ playerHitPointsValue, enemyHitPointsValue }) =>
        character === 'player-character'
          ? enemyHitPointsValue > playerHitPointsValue
          : playerHitPointsValue > enemyHitPointsValue
      )
      .map(({ dealtDamage }) => dealtDamage)
      .reduce((acc, val) => acc + val, 0);
  }
}
