import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CreateCharacter } from '../game/interfaces/create-character';
import { StatisticsPanelComponent } from '../game/ui/statistics-panel/statistics-panel.component';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Statistics } from '../../shared/interfaces/statistics';
import { ItemComponent } from '../../shared/components/item/item.component';
import { CharacterClassDto } from '../../shared/api/character-classes/model/character-class.dto';
import { CreateCharacterService } from './services/create-character.service';
import { Item } from 'app/shared/interfaces/item';
import { map, of, switchMap, tap } from 'rxjs';
import { CONSTS } from './utils/create-character.const';
import { Router } from '@angular/router';
import { CharacterClassTranslatePipe } from 'app/shared/pipes/character-class-translate.pipe';
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
  providers: [CreateCharacterService],
  templateUrl: './create-character.component.html',
  styleUrl: './create-character.component.scss',
})
export class CreateCharacterComponent {
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private _createCharacterService = inject(CreateCharacterService);

  characterClasses = toSignal(
    this._createCharacterService.getCharacterClasses$().pipe(
      map(classes =>
        classes.map(c => ({
          name: new CharacterClassTranslatePipe().transform(c),
          value: c,
        }))
      )
    ),
    { initialValue: [] }
  );

  characterCreationForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    characterClass: [this.characterClasses()[0], [Validators.required]],
  });
  image: File | undefined;
  previewImage: string | ArrayBuffer | null;
  selectedCharacterClass: CharacterClassDto | undefined;

  statistics = toSignal(
    this.characterCreationForm.valueChanges.pipe(
      map(value =>
        value.characterClass
          ? this.getStatistics(value.characterClass.value)
          : CONSTS.INIT_STATISTICS
      )
    ),
    { initialValue: CONSTS.INIT_STATISTICS }
  );
  startingWeapon = toSignal(
    this.characterCreationForm.valueChanges.pipe(
      switchMap(value => {
        return value.characterClass
          ? this._createCharacterService.getStartingWeaponOnClassSelect$(
              value.characterClass.value
            )
          : of(undefined);
      })
    )
  );
  loading = false;
  upload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.item(0);
    if (file) {
      this.image = file;
      const reader = new FileReader();
      reader.onload = e => (this.previewImage = reader.result);

      reader.readAsDataURL(file);
    }
  }
  submit() {
    const startingItem = this.startingWeapon();
    if (this.characterCreationForm.valid && this.image && startingItem) {
      const name = this.characterCreationForm.getRawValue().name;
      const characterClassId =
        this.characterCreationForm.getRawValue().characterClass.value.id;
      const equippedItems = [startingItem.tokenId.toString()];
      const newCharacter: CreateCharacter = {
        name,
        image: this.image,
        characterClassId,
        equippedItems,
      };
      this._createCharacterService
        .createCharacter$(newCharacter)
        .pipe(
          tap(() => this.router.navigate(['/game'])),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe();
    }
  }
  private getStatistics(characterClass: CharacterClassDto): Statistics {
    const { startingHealth, startingEnergy, startingPowerPoints } =
      characterClass;
    return {
      health: { actualValue: startingHealth, maximumValue: startingHealth },
      energy: { actualValue: startingEnergy, maximumValue: startingEnergy },
      powerPoints: {
        actualValue: startingPowerPoints,
        maximumValue: startingPowerPoints,
      },
    };
  }
}
