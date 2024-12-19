import { CommonModule } from '@angular/common';
import { Component, input, model, output, viewChild } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import {
  FileSelectEvent,
  FileUpload,
  FileUploadModule,
} from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SubSectionTitleComponent } from '../../../../../shared/components/sub-section-title/sub-section-title.component';
import { ImageModule } from 'primeng/image';
import { MAX_FILE_SIZE } from '../../../../../shared/constants/config.const';
import { Texts } from '../../../texts/texts.const';
@Component({
  selector: 'jfudali-enemy-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    InputTextareaModule,
    ButtonModule,
    FileUploadModule,
    CardModule,
    SubSectionTitleComponent,
    ImageModule,
  ],
  templateUrl: './enemy-form.component.html',
  styleUrl: './enemy-form.component.scss',
})
export class EnemyFormComponent {
  enemyImagePicker = viewChild.required<FileUpload>('enemyImagePicker');
  weaponImagePicker = viewChild.required<FileUpload>('weaponImagePicker');
  imageSrc = model<string>();
  weaponImageSrc = model<string>();
  form = input.required<FormGroup>();
  onImageSelect = output<File>();
  onWeaponImageSelect = output<File>();
  maxFileSize = MAX_FILE_SIZE;
  texts = Texts;
  private initImage: string | undefined;
  private initWeaponImage: string | undefined;
  setImage(event: FileSelectEvent) {
    if (!this.initImage) this.initImage = this.imageSrc();
    const file = event.files[0];
    this.imageSrc.set(URL.createObjectURL(file));
    this.onImageSelect.emit(file);
  }
  setWeaponImage(event: FileSelectEvent) {
    if (!this.initWeaponImage) this.initWeaponImage = this.weaponImageSrc();
    const file = event.files[0];
    this.weaponImageSrc.set(URL.createObjectURL(file));
    this.onWeaponImageSelect.emit(file);
  }
  clearImage() {
    this.imageSrc.set(this.initImage);
  }
  clearWeaponImage() {
    this.weaponImageSrc.set(this.initWeaponImage);
  }
  clear() {
    this.enemyImagePicker().clear();
    this.weaponImagePicker().clear();
  }
}
