import { restoreHealth } from '../../../shared/utils/functions';
import { Injectable, inject } from '@angular/core';
import { PlayerCharacterDto } from '../../../shared/api/player-character/model/player-character.dto';
import {
  BehaviorSubject,
  Observable,
  Subject,
  concatMap,
  endWith,
  filter,
  forkJoin,
  interval,
  map,
  merge,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { OwnedItem } from '../../../shared/interfaces/owned-item';
import { CreateCharacter } from '../interfaces/create-character';
import { NavigationStart, Router } from '@angular/router';
import {
  dealDamage,
  reduceEnergyByTen,
  restoreEnergy,
} from '../../../shared/utils/functions';
import { ThirdwebService } from '../../../shared/thirdweb/thirdweb.service';
import { PlayerCharacterApiService } from '../../../shared/api/player-character/player-character-api.service';
import { TEXTS } from '../texts/texts.const';
import { GetRestDialogComponent } from '../ui/get-rest-dialog/get-rest-dialog.component';
import { DialogService } from 'primeng/dynamicdialog';
import { Statistics } from 'app/shared/interfaces/statistics';

@Injectable()
export class PlayerCharacterService {
  private dialog = inject(DialogService);
  private router = inject(Router);
  private _playerCharacterApiService = inject(PlayerCharacterApiService);
  private _thirdwebService = inject(ThirdwebService);
  private stopRest$ = new Subject<void>();
  private _playerCharacter$ = new BehaviorSubject<PlayerCharacterDto>(
    {} as PlayerCharacterDto
  );
  private _isResting = new BehaviorSubject<boolean>(false);

  init(pc: PlayerCharacterDto) {
    this._playerCharacter$.next(pc);
  }
  levelUp(): void {
    const pc = this._playerCharacter$.getValue();
    const energy = pc.characterClass.startingEnergy;
    const health = pc.characterClass.startingHealth;
    const powerPoints = pc.characterClass.startingPowerPoints;
    const newStatistics: Statistics = {
      energy: {
        actualValue: pc.statistics.energy.actualValue + energy,
        maximumValue: pc.statistics.energy.maximumValue + energy,
      },
      health: {
        actualValue: pc.statistics.health.actualValue + health,
        maximumValue: pc.statistics.health.maximumValue + health,
      },
      powerPoints: {
        actualValue: pc.statistics.powerPoints.actualValue + powerPoints,
        maximumValue: pc.statistics.powerPoints.maximumValue + powerPoints,
      },
    };
    this._playerCharacter$.next({
      ...pc,
      level: pc.level + 1,
      statistics: newStatistics,
    });
  }
  getPlayerCharacter$(): Observable<PlayerCharacterDto> {
    return this._playerCharacter$.asObservable();
  }
  getPlayerCharacter(): PlayerCharacterDto {
    return this._playerCharacter$.getValue();
  }
  forceRest() {
    this.router.navigate(['/game']);
    this.dialog.open(GetRestDialogComponent, {
      header: TEXTS.GAME_PANEL_REST,
    });
  }
  checkIfRestIsNeed(pc: PlayerCharacterDto) {
    return (
      pc.statistics.health.actualValue === 0 ||
      pc.statistics.energy.actualValue - 10 < 0
    );
  }

  createCharacter$(newCharacter: CreateCharacter): Observable<unknown> {
    return forkJoin([
      this._playerCharacterApiService.createCharacter(newCharacter),
      this._thirdwebService.claimStartingWeapon(
        BigInt(newCharacter.equippedItems[0])
      ),
    ]).pipe(tap(([pc]) => this._playerCharacter$.next(pc)));
  }
  reduceEnergyByTen(): void {
    this._playerCharacter$.next(
      reduceEnergyByTen(this._playerCharacter$.getValue())
    );
  }
  restoreHealth(health: number): void {
    this._playerCharacter$.next(
      restoreHealth(this._playerCharacter$.getValue(), health)
    );
  }
  restoreEnergy(energy: number): void {
    this._playerCharacter$.next(
      restoreEnergy(this._playerCharacter$.getValue(), energy)
    );
  }
  dealDamage(damage: number): void {
    this._playerCharacter$.next(
      dealDamage(this._playerCharacter$.getValue(), damage)
    );
  }
  equipItem(item: OwnedItem): void {
    this._playerCharacter$.next({
      ...this._playerCharacter$.getValue(),
      equippedItems: [
        ...this._playerCharacter$.getValue().equippedItems,
        item.tokenId,
      ],
    });
  }
  unequipItem(item: OwnedItem): void {
    this._playerCharacter$.next({
      ...this._playerCharacter$.getValue(),
      equippedItems: this._playerCharacter$
        .getValue()
        .equippedItems.filter(i => i !== item.tokenId),
    });
  }
  stopRest(): void {
    this.stopRest$.next();
  }
  rest(): Observable<void> {
    return this._playerCharacterApiService.rest().pipe(
      tap(() => this._isResting.next(true)),
      concatMap(restData =>
        interval(1000).pipe(
          tap(() => {
            this.restoreEnergy(restData.energyPerSecond);
            this.restoreHealth(restData.healthPerSecond);
          }),
          takeUntil(this.getRestStopTriggers()),
          endWith('done')
        )
      ),
      filter(status => status === 'done'),
      switchMap(() =>
        this._playerCharacterApiService
          .stopRest(new Date())
          .pipe(tap(() => this._isResting.next(false)))
      )
    );
  }
  getIsResting$(): Observable<boolean> {
    return this._isResting.asObservable();
  }
  getIsResting(): boolean {
    return this._isResting.getValue();
  }

  private isPlayerCharacterRegenerated(): Observable<PlayerCharacterDto> {
    return this.getPlayerCharacter$().pipe(
      filter(
        pc =>
          pc?.statistics?.energy.actualValue ===
          pc?.statistics?.energy.maximumValue
      ),
      filter(
        pc =>
          pc?.statistics?.health.actualValue ===
          pc?.statistics?.health.maximumValue
      )
    );
  }
  private getRestStopTriggers(): Observable<unknown> {
    return merge(
      this.isPlayerCharacterRegenerated(),
      this.stopRest$,
      this.router.events.pipe(filter(event => event instanceof NavigationStart))
    );
  }
}
