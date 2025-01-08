import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { TabViewModule } from 'primeng/tabview';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { MessagesModule } from 'primeng/messages';
import { Router, RouterModule } from '@angular/router';
import { EncounterDecisionsComponent } from './ui/encounter-decisions/encounter-decisions.component';
import { EncounterDetailsComponent } from '../ui/encounter-details/encounter-details.component';
import { PlayerCharacterComponent } from '../ui/player-character/player-character.component';
import { DecisionDto } from 'app/shared/api/encounters';
import { EncounterService } from './services/encounter.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, tap } from 'rxjs';
import { EffectDisplayDialogComponent } from './ui/effect-display-dialog/effect-display-dialog.component';
import { DialogService } from 'primeng/dynamicdialog';
import { HttpErrorResponse } from '@angular/common/http';
import { TEXTS } from '../texts/texts.const';
import { LevelUpDialogComponent } from './ui/level-up-dialog/level-up-dialog.component';
import { FightComponent } from './ui/fight/fight.component';

@Component({
  selector: 'jfudali-encounter',
  standalone: true,
  providers: [EncounterService],
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
  private dialog = inject(DialogService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private _encounterService = inject(EncounterService);
  readonly texts = TEXTS;
  playerCharacter = toSignal(this._encounterService.getPlayerCharacter$());
  equippedWeapon = toSignal(this._encounterService.getEquippedWeapon$());
  equippedArmorSum = toSignal(this._encounterService.getArmorSum$());
  randomEncounter = toSignal(
    this._encounterService.getRandomEncounter$().pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 409) {
          this.router.navigate(['/game']);
        }
        return EMPTY;
      })
    )
  );
  fight = toSignal(this._encounterService.simulateFight$());
  selectedDecision: DecisionDto | undefined;

  ngOnInit(): void {
    this.loadEncounter();
  }

  startFight(): void {
    const encounter = this.randomEncounter();
    if (encounter) this._encounterService.startFight(encounter.id);
  }
  dealDamagetoPlayerCharacter(damage: number) {
    this._encounterService.dealDamageToPlayerCharacter(damage);
  }
  selectDecision(encounterId: string, decision: DecisionDto) {
    this.selectedDecision = decision;
    this._encounterService
      .selectDecision$(encounterId, decision.text)
      .pipe(
        tap(({ userLevelUp }) => {
          this.showLevelUpDialog(userLevelUp);
        }),
        tap(({ effect }) => {
          const ref = this.dialog.open(EffectDisplayDialogComponent, {
            data: {
              effect,
            },
            closable: false,
            header: this.texts.EFFECT,
          });
          return ref.onClose.subscribe((nextEncounter: boolean) => {
            if (nextEncounter) {
              this.loadEncounter();
            } else {
              this.router.navigate(['/game']);
            }
          });
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => (this.selectedDecision = undefined));
  }
  showLevelUpDialog(userLevelUp: boolean) {
    if (userLevelUp) {
      this.dialog.open(LevelUpDialogComponent, {
        header: this.texts.LEVEL_UP,
      });
      this._encounterService.levelUp();
    }
  }
  skip(pcDamage: number) {
    this._encounterService.dealDamageToPlayerCharacter(pcDamage);
  }
  finishFight() {
    this.loadEncounter();
  }
  private loadEncounter() {
    if (!this._encounterService.checkRestNeed()) {
      this._encounterService.loadEncounter();
    }
  }
}
