import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  input,
  model,
  viewChild,
  ChangeDetectionStrategy,
  OnInit,
  effect,
} from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  FileSelectEvent,
  FileUpload,
  FileUploadModule,
} from 'primeng/fileupload';
import { Texts } from '../../../texts/texts.const';
import { ImageModule } from 'primeng/image';
import { Constants } from '../../utils/items.const';

@Component({
  selector: 'jfudali-item-form',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    FileUploadModule,
    DropdownModule,
    InputNumberModule,
    InputTextareaModule,
    ReactiveFormsModule,
    ImageModule,
  ],
  templateUrl: './item-form.component.html',
  styleUrl: './item-form.component.scss',
})
export class ItemFormComponent {
  imagePicker = viewChild.required<FileUpload>('imagePicker');
  form = input.required<FormGroup>();
  isArmor = input.required<boolean>();
  disablePicker = input.required<boolean>();
  image = model<File>();
  imageSrc = model<string>();
  texts = Texts;
  consts = Constants;
  initialImage: string | undefined;

  selectImage(event: FileSelectEvent) {
    if (!this.initialImage) this.initialImage = this.imageSrc();
    this.image.set(event.files[0]);
    this.imageSrc.set(URL.createObjectURL(event.files[0]));
  }
  clearImage() {
    this.image.set(undefined);
    this.imageSrc.set(this.initialImage ? this.initialImage : undefined);
  }
  clear() {
    this.imagePicker().clear();
  }
}
