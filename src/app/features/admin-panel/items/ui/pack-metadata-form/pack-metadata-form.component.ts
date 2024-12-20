import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ItemsFormGroupGenerator } from '../../utils/items-form-group.generator';
import { ReactiveFormsModule } from '@angular/forms';
import { Texts } from '../../../texts/texts.const';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'jfudali-pack-metadata-form',
  standalone: true,
  imports: [
    CommonModule,
    DynamicDialogModule,
    FileUploadModule,
    InputTextModule,
    InputTextareaModule,
    ReactiveFormsModule,
    ButtonModule,
    InputNumberModule,
  ],
  templateUrl: './pack-metadata-form.component.html',
  styleUrl: './pack-metadata-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackMetadataFormComponent {
  private dialogRef = inject(DynamicDialogRef);
  texts = Texts;
  form = ItemsFormGroupGenerator.getPackMetadataFormGroup();
  selectedImage: File | undefined;
  selectImage(e: FileSelectEvent) {
    this.selectedImage = e.files[0];
  }
  submit() {
    this.dialogRef.close({ ...this.form.value, image: this.selectedImage });
  }
  clear() {
    this.selectedImage = undefined;
  }
}
