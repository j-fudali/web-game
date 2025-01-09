import { inject, Injectable } from '@angular/core';
import { PlayerCharacterService } from 'app/features/game/services/player-character.service';
import { EquipmentService } from '../../services/equipment.service';
import { FightApiService } from 'app/shared/api/fight';
import {
  map,
  Subject,
  switchMap,
  tap,
  of,
  Observable,
  shareReplay,
  withLatestFrom,
  merge,
} from 'rxjs';
import { ENCOUNTER_CONST } from '../utils/encounter.const';
import { EffectDto, EncounterApiService } from 'app/shared/api/encounters';
import { ThirdwebService } from 'app/shared/thirdweb/thirdweb.service';

@Injectable()
export class EncounterService {
  private _thirdwebService = inject(ThirdwebService);
  private _encountersApiService = inject(EncounterApiService);
  private _playerCharacterService = inject(PlayerCharacterService);
  private _equipmentService = inject(EquipmentService);
  private _fightApiService = inject(FightApiService);
  private loadEncounter$ = new Subject<void>();
  private startFight$ = new Subject<string>();
  private resetFight$ = new Subject<void>();
  private randomEncounter$ = this.loadEncounter$.pipe(
    tap(() => this.resetFight$.next()),
    switchMap(() =>
      this._encountersApiService
        .loadRandomEncounter(
          this._playerCharacterService.getPlayerCharacter().level
        )
        .pipe(tap(() => this._playerCharacterService.reduceEnergyByTen()))
    )
  );
  private fight$ = merge(
    this.startFight$.pipe(
      withLatestFrom(this.getEquippedWeapon$(), this.getArmorSum$()),
      switchMap(([encounterId, weapon, armor]) =>
        this._fightApiService.simulateFight(
          encounterId,
          weapon?.damage || ENCOUNTER_CONST.DEFAULT_DAMAGE,
          armor
        )
      )
    ),
    this.resetFight$.pipe(map(() => undefined))
  );
  equipItems$() {
    return this.getEquippedItems$().pipe(
      map(items => items.map(i => i.tokenId)),
      switchMap(items => this._equipmentService.saveEquippedItems$(items))
    );
  }
  dealDamageToPlayerCharacter(damage: number) {
    this._playerCharacterService.dealDamage(damage);
  }
  getPlayerCharacter$() {
    return this._playerCharacterService.getPlayerCharacter$();
  }
  checkRestNeed() {
    if (
      this._playerCharacterService.checkIfRestIsNeed(
        this._playerCharacterService.getPlayerCharacter()
      )
    ) {
      this._playerCharacterService.forceRest();
      return true;
    }
    return false;
  }
  getEquippedItems$() {
    return this._equipmentService.getEquippedItems$();
  }
  getEquippedWeapon$() {
    return this._equipmentService.getEquippedWeapon$();
  }
  getArmorSum$() {
    return this._equipmentService.getArmorSum$();
  }
  simulateFight$() {
    return this.fight$;
  }
  startFight(encounterId: string) {
    this.startFight$.next(encounterId);
  }
  selectDecision$(encounterId: string, decision: string) {
    return this._encountersApiService
      .selectDecision(encounterId, decision)
      .pipe(
        tap(console.log),
        switchMap(data => this.resolveEffect(data.effect).pipe(map(() => data)))
      );
  }
  levelUp() {
    this._playerCharacterService.levelUp();
  }
  getRandomEncounter$() {
    return this.randomEncounter$;
  }
  loadEncounter() {
    this.loadEncounter$.next();
  }
  private resolveEffect(effect: EffectDto): Observable<unknown> {
    if (effect.healthAmount) {
      if (effect.healthAmount >= 0) {
        this._playerCharacterService.restoreHealth(effect.healthAmount);
      } else {
        this._playerCharacterService.dealDamage(effect.healthAmount * -1);
      }
    }
    if (effect.goldAmount) {
      if (effect.goldAmount === 0) return of(null);
      if (effect.goldAmount > 0) {
        return this._thirdwebService.claimGearcoin(effect.goldAmount);
      }
    }
    return of(null);
  }
}
