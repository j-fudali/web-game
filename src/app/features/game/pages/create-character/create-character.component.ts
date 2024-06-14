import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CreateCharacter } from '../../interfaces/create-character';
import { map } from 'rxjs';
import { StatisticsPanelComponent } from '../../components/statistics-panel/statistics-panel.component';
import { CharacterClassesService } from '../../../../shared/services/character-classes.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Statistics } from '../../../../shared/interfaces/statistics';
import { StartingItemsService } from '../../services/starting-items.service';
import { ItemComponent } from '../../../../shared/components/item/item.component';
import { CharacterClass } from '../../../../shared/interfaces/character-class';
import { PlayerCharacterService } from '../../../../shared/services/player-character.service';
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
  private _playerCharacterService = inject(PlayerCharacterService);
  private _characterService = inject(CharacterClassesService);
  private _startingItemsService = inject(StartingItemsService);
  status = this._playerCharacterService.state.status;
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
        equippedItems: [this.startingItem()!.tokenId.toString()],
      };
      this._playerCharacterService.createCharacter$.next(newCharacter);
    }
  }
}
