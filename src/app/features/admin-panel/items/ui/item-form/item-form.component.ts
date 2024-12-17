import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  computed,
  model,
  output,
  viewChild,
} from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownClassType } from './interfaces/dropdown-class-type';
import { ClassType } from '../../../../../shared/enums/class-type.enum';
import { ItemType } from '../../../../../shared/enums/item-type.enum';
import { DropdownItemType } from './interfaces/dropdown-item-type';
import { DropdownBodySlot } from './interfaces/dropdown-body-slot';
import { BodySlot } from '../../../../../shared/enums/body-slot.enum';
import { ItemsFormGroupGenerator } from '../../utils/items-form-group.generator';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith, tap } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
  image = model<File>();
  imageSrc = model<string>();
  texts = Texts;
  consts = Constants;

  selectImage(event: FileSelectEvent) {
    this.image.set(event.files[0]);
    this.imageSrc.set(URL.createObjectURL(event.files[0]));
  }
  clearImage() {
    this.image.set(undefined);
    this.imageSrc.set(undefined);
  }
  clear() {
    this.imagePicker().clear();
  }
}
