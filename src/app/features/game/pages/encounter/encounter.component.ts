import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject } from '@angular/core';
import { PlayerCharacterComponent } from '../../components/player-character/player-character.component';
import { ItemsSlotsComponent } from '../../components/items-slots/items-slots.component';
import { PlayerCharacterService } from '../../../../shared/services/player-character.service';
import { ItemsService } from '../../../../shared/services/items.service';
import { EncounterDetailsComponent } from '../../components/encounter-details/encounter-details.component';
import { EncounterDecisionsComponent } from '../../components/encounter-decisions/encounter-decisions.component';
import { TabViewModule } from 'primeng/tabview';
import { RandomEncounterService } from '../../services/random-encounter.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { MessagesModule } from 'primeng/messages';
import { RouterModule } from '@angular/router';
import { Decision } from '../../../../shared/interfaces/decision';
import { FightService } from '../../services/fight.service';
import { FightComponent } from '../../components/fight/fight.component';
import { DecisionEncounter } from '../../../../shared/interfaces/encounter';
import { EquipmentService } from '../../../../shared/services/equipment.service';
import { ThirdwebService } from '../../../../shared/thirdweb/thirdweb.service';
import { WalletService } from '../../../../shared/services/wallet.service';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { pipe, switchMap } from 'rxjs';
@Component({
  selector: 'jfudali-encounter',
  standalone: true,
  providers: [FightService],
  imports: [
    CommonModule,
    TabViewModule,
    ButtonModule,
    MessagesModule,
    RouterModule,
    PlayerCharacterComponent,
    EncounterDetailsComponent,
    EncounterDecisionsComponent,
    ProgressSpinnerModule,
    FightComponent,
  ],
  templateUrl: './encounter.component.html',
  styleUrl: './encounter.component.scss',
})
export class EncounterComponent implements OnInit {
  private _playerCharacterService = inject(PlayerCharacterService);
  private _itemsService = inject(ItemsService);
  private _equipmentService = inject(EquipmentService);
  private _randomEncounterService = inject(RandomEncounterService);
  private _fightService = inject(FightService);
  playerCharacter = this._playerCharacterService.state.playerCharacter;
  equippedItems = this._equipmentService.state.equippedItems;
  availableItems = this._equipmentService.state.avaliableItems;
  itemsStatus = this._itemsService.state.status;
  equippedWeapon = computed(() =>
    this.equippedItems().find(item => item.type === 'weapon')
  );
  equippedArmorSum = computed(() => {
    const armors = this.equippedItems().filter(item => item.type === 'armor');
    if (armors.length === 0) return 0;
    return armors
      .map(({ armor }) => (armor ? armor : 0))
      .reduce((a, b) => a + b);
  });
  selectedDecision: Decision | undefined;

  randomEncounter = this._randomEncounterService.state.randomEncounter;
  decisions = computed(
    () => (this.randomEncounter() as DecisionEncounter).decisions
  );
  effect = this._randomEncounterService.state.effect;

  enemy = this._randomEncounterService.state.enemy;
  encounterStatus = this._randomEncounterService.state.status;
  encounterError = this._randomEncounterService.state.error;

  fight = this._fightService.state.fight;
  fightStatus = this._fightService.state.status;
  fightError = this._fightService.state.error;
  ngOnInit(): void {
    this.loadEncounter();
  }
  loadEncounter() {
    this._randomEncounterService.loadRandomEncounter$.next();
  }
  simulateFight() {
    this._fightService.fightStart$.next({
      damage: this.equippedWeapon()?.damage || 0,
      armor: this.equippedArmorSum(),
    });
  }
  selectDecision(decision: Decision) {
    this.selectedDecision = decision;
    this._randomEncounterService.selectDecision$.next({
      encounterId: this.randomEncounter()!.id,
      decision: decision.text,
    });
    this.selectedDecision = undefined;
  }
  dealDamage(damage: number, target: 'player-character' | 'enemy') {
    if (target === 'enemy') {
      this._randomEncounterService.dealDamageToEnemy$.next(damage);
    } else {
      this._playerCharacterService.dealDamageToPlayerCharacter$.next(damage);
    }
  }
  skip(fightResult: { pcDamage: number; enemyDamage: number }) {
    this._playerCharacterService.dealDamageToPlayerCharacter$.next(
      fightResult.pcDamage
    );
    this._randomEncounterService.dealDamageToEnemy$.next(
      fightResult.enemyDamage
    );
  }
  finishFight() {
    const random = Math.floor(Math.random() * 100) + 1;
    if (random < 100) {
    }
    this.loadEncounter();
  }
}
