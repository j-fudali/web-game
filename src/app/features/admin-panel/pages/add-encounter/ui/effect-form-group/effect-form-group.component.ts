import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Input,
  input,
} from '@angular/core';
import {
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'jfudali-effect-form-group',
  standalone: true,
  imports: [
    CommonModule,
    InputNumberModule,
    InputTextModule,
    ReactiveFormsModule,
  ],
  templateUrl: './effect-form-group.component.html',
  styleUrl: './effect-form-group.component.scss',
  // providers: [
  //   {
  //     provide: NG_VALUE_ACCESSOR,
  //     multi: true,
  //     useExisting: forwardRef(() => EffectFormGroupComponent),
  //   },
  // ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EffectFormGroupComponent {
  @Input({ required: true })
  formGroup: FormGroup;
}
