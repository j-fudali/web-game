import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CharacterCreationService } from '../../services/character-creation.service';
import { CreateCharacter } from '../../interfaces/create-character';
import { catchError, map, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { PlayerCharacter } from '../../../../shared/interfaces/player-character';
import { StatisticsPanelComponent } from '../../components/statistics-panel/statistics-panel.component';
import { PlayerService } from '../../../../shared/services/player.service';
import { CharacterService } from '../../../../shared/services/character.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Statistics } from '../../../../shared/interfaces/statistics';
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
  ],
  templateUrl: './create-character.component.html',
  styleUrl: './create-character.component.scss',
})
export class CreateCharacterComponent {
  private fb = inject(FormBuilder);
  private __characterCreation = inject(CharacterCreationService);
  private _messageService = inject(MessageService);
  private _playerService = inject(PlayerService);
  private _characterService = inject(CharacterService);
  characterClasses = this._characterService.characterClasses;
  characterCreationForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    characterClass: ['', [Validators.required]],
  });

  image: File | undefined;
  previewImage: string | ArrayBuffer | null | undefined;

  characterClassId = toSignal<string>(
    this.characterCreationForm.valueChanges.pipe(map((v) => v.characterClass!)),
    { initialValue: undefined }
  );
  statistics = computed(() => {
    if (!this.characterClassId())
      return {
        health: { actualValue: 0, maximumValue: 100 },
        energy: { actualValue: 0, maximumValue: 100 },
        powerPoints: {
          actualValue: 0,
          maximumValue: 100,
        },
      } as Statistics;
    const { id, name, ...statistics } = this.characterClasses().find(
      (c) => c.id == this.characterClassId()
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
        characterClassId: this.characterCreationForm.value.characterClass!,
      };
      this.__characterCreation
        .createCharacter(newCharacter)
        .pipe(
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
        .subscribe((character: PlayerCharacter) =>
          this._playerService.setPlayerCharacter(character)
        );
    }
  }
}
