import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { CharacterClass } from '../../../../shared/enums/character-class.enum';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CharacterCreationService } from '../../services/character-creation.service';
import { CreateCharacter } from '../../interfaces/create-character';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
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
  ],
  templateUrl: './create-character.component.html',
  styleUrl: './create-character.component.scss',
})
export class CreateCharacterComponent {
  private fb = inject(FormBuilder);
  private __characterCreation = inject(CharacterCreationService);
  private _messageService = inject(MessageService);
  characterClasses = CharacterClass;
  characterCreationForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    characterClass: [CharacterClass.Mag, [Validators.required]],
  });
  image: File | undefined;
  previewImage: string | ArrayBuffer | null | undefined;
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
        characterClass: this.characterCreationForm.value
          .characterClass as CharacterClass,
      };
      this.__characterCreation
        .createCharacter(newCharacter)
        .pipe(
          catchError((err: HttpErrorResponse) => {
            console.log(err);
            if (err.status == 409) {
              this._messageService.add({
                severity: 'error',
                detail: 'Posiadasz już postać',
              });
            }
            return throwError(() => err);
          })
        )
        .subscribe((res) => console.log(res));
    }
  }
}
