import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Subject,
  merge,
  interval,
  takeWhile,
  takeUntil,
  tap,
  endWith,
  filter,
} from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessagesModule } from 'primeng/messages';
import { dealDamage } from 'app/shared/utils/functions';
import { FightDto } from 'app/shared/api/fight';
import { Enemy } from 'app/shared/interfaces/enemy';
import { Item } from 'app/shared/interfaces/item';
import { TEXTS } from 'app/features/game/texts/texts.const';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'jfudali-rounds',
  standalone: true,
  imports: [
    CommonModule,
    MessagesModule,
    NgOptimizedImage,
    ButtonModule,
    CardModule,
    RouterLink,
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
  readonly texts = TEXTS;
  onFightEnd = output<void>();
  dealDamagePlayerCharacter = output<number>();
  onLoadEncounter = output<void>();
  onSkip = output<number>();

  fight = input.required<FightDto>();
  playerCharacterWeapon = input<Item>();
  playerCharacterName = input.required<string>();
  enemy = model.required<Enemy>();

  rounds = computed(() => this.fight().rounds);
  winner = computed(() =>
    this.fight().userWon ? this.playerCharacterName() : this.enemy().name
  );
  enemyWeapon = computed(() => this.enemy().weapon);

  private skipToLast$ = new Subject<void>();
  private onSkipToLast$ = this.skipToLast$.pipe(
    tap(() => this.currentIndex.set(this.rounds().length))
  );
  currentIndex = signal(0);

  constructor() {
    merge(
      interval(4000).pipe(
        tap(() => {
          if (this.currentIndex() < this.rounds().length) {
            const round = this.rounds()[this.currentIndex()];
            if (round.enemyHitPointsValue > round.playerHitPointsValue) {
              this.dealDamagePlayerCharacter.emit(round.dealtDamage);
            } else if (round.playerHitPointsValue > round.enemyHitPointsValue) {
              this.enemy.update(enemy => dealDamage(enemy, round.dealtDamage));
            }
          }
        }),
        tap(() => this.currentIndex.set(this.currentIndex() + 1)),
        takeWhile(() => this.currentIndex() <= this.rounds().length),
        takeUntil(this.onSkipToLast$),
        endWith('done'),
        filter(val => val === 'done')
      ),
      this.onSkipToLast$
    )
      .pipe(
        tap(() => this.onFightEnd.emit()),
        takeUntilDestroyed()
      )
      .subscribe();
  }

  skip() {
    const pcDamage = this.calculateRestOfDamage('player-character');
    const enemyDamage = this.calculateRestOfDamage('enemy');
    this.skipToLast$.next();
    this.onSkip.emit(pcDamage);
    this.enemy.set(dealDamage(this.enemy(), enemyDamage));
  }
  private calculateRestOfDamage(character: 'player-character' | 'enemy') {
    return this.rounds()
      .slice(this.currentIndex())
      .filter(({ playerHitPointsValue, enemyHitPointsValue }) =>
        character === 'player-character'
          ? enemyHitPointsValue > playerHitPointsValue
          : playerHitPointsValue > enemyHitPointsValue
      )
      .map(({ dealtDamage }) => dealtDamage)
      .reduce((acc, val) => acc + val, 0);
  }
}
