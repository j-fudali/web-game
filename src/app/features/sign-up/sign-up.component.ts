import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { PASSWORD_PATTERN } from '../../shared/constants/config.const';
import { passwordMatch } from '../../shared/validators/passwordMatch.validator';
import { SignUpService } from './services/sign-up.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
@Component({
  selector: 'jfudali-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ReactiveFormsModule,
    InputTextModule,
    MessageModule,
    TooltipModule,
  ],
  providers: [SignUpService],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private _signUpService = inject(SignUpService);
  signUpForm = this.fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [Validators.required, Validators.pattern(PASSWORD_PATTERN)],
      ],
      rePassword: ['', [Validators.required]],
    },
    { validators: passwordMatch }
  );
  get email() {
    return this.signUpForm.get('email') as FormControl;
  }

  get password() {
    return this.signUpForm.get('password') as FormControl;
  }

  get rePassword() {
    return this.signUpForm.get('rePassword') as FormControl;
  }

  onSubmit() {
    if (this.signUpForm.valid) {
      this._signUpService
        .signUp$(this.signUpForm.getRawValue())
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.router.navigate(['/game']);
        });
    }
  }
}
