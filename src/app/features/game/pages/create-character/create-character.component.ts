import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CharacterCreationService } from '../../services/character-creation.service';
import { CreateCharacter } from '../../interfaces/create-character';
import { catchError, map, switchMap, tap, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { PlayerCharacter } from '../../../../shared/interfaces/player-character';
import { StatisticsPanelComponent } from '../../components/statistics-panel/statistics-panel.component';
import { PlayerService } from '../../../../shared/services/player.service';
import { CharacterService } from '../../../../shared/services/character.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Statistics } from '../../../../shared/interfaces/statistics';
import { Router } from '@angular/router';
import { StartingItemsService } from '../../services/starting-items.service';
import { ItemComponent } from '../../../../shared/components/item/item.component';
import { CharacterClass } from '../../../../shared/interfaces/character-class';
@Component({
  selector: 'jfudali-create-character',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    FileUploadModule,
    CardModule,
    ButtonModule,
    StatisticsPanelComponent,
    ItemComponent,
  ],
  templateUrl: './create-character.component.html',
  styleUrl: './create-character.component.scss',
})
export class CreateCharacterComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private __characterCreation = inject(CharacterCreationService);
  private _messageService = inject(MessageService);
  private _playerService = inject(PlayerService);
  private _characterService = inject(CharacterService);
  private _startingItemsService = inject(StartingItemsService);
  startingItems = this._startingItemsService.state.items;
  characterClasses = this._characterService.characterClasses;
  characterCreationForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    characterClass: [this.characterClasses()[0], [Validators.required]],
  });

  image: File | undefined;
  previewImage: string | ArrayBuffer | null | undefined;

  characterClass = toSignal<CharacterClass>(
    this.characterCreationForm.valueChanges.pipe(map((v) => v.characterClass!)),
    {
      initialValue: undefined,
    }
  );
  startingItem = computed(() =>
    this.startingItems().find(
      (item) => item.classType == this.characterClass()?.name.toLowerCase()
    )
  );
  statistics = computed(() => {
    if (!this.characterClass()) {
      return {
        health: { actualValue: 0, maximumValue: 100 },
        energy: { actualValue: 0, maximumValue: 100 },
        powerPoints: {
          actualValue: 0,
          maximumValue: 100,
        },
      } as Statistics;
    }
    const { id, name, ...statistics } = this.characterClasses().find(
      (c) => c.id == this.characterClass()?.id
    )!;
    const { startingHealth, startingEnergy, startingPowerPoints } = statistics;
    return {
      health: { actualValue: startingHealth, maximumValue: startingHealth },
      energy: { actualValue: startingEnergy, maximumValue: startingEnergy },
      powerPoints: {
        actualValue: startingPowerPoints,
        maximumValue: startingPowerPoints,
      },
    } as Statistics;
  });

  upload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.item(0);
    if (file) {
      this.image = file;
      const reader = new FileReader();
      reader.onload = (e) => (this.previewImage = reader.result);

      reader.readAsDataURL(file);
    }
  }
  submit() {
    if (this.characterCreationForm.valid && this.image) {
      const newCharacter: CreateCharacter = {
        name: this.characterCreationForm.value.name!,
        image: this.image,
        characterClassId: this.characterCreationForm.value.characterClass!.id,
      };
      this.__characterCreation
        .createCharacter(newCharacter)
        .pipe(
          tap((character) => this._playerService.setOnSignUp$.next(character)),
          switchMap(() =>
            this._startingItemsService.claimItem(this.startingItem()!.tokenId)
          ),
          catchError((err: HttpErrorResponse) => {
            if (err.status == 409) {
              this._messageService.add({
                severity: 'error',
                detail: 'Posiadasz już postać',
              });
            }
            return throwError(() => err);
          })
        )
        .subscribe(() => {
          this.router.navigate(['/game/create-character']);
        });
    }
  }
}
