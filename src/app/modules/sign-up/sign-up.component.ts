import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PASSWORD_PATTERN } from '../../core/constants/config.constants';
import { passwordMatch } from '../../core/validators/passwordMatch.validator';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { SignUpCredentials } from '../../core/interfaces/sign-up-credentials';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent {
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private _auth = inject(AuthService);
  signUpForm = this.fb.group(
    {
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [Validators.required, Validators.pattern(PASSWORD_PATTERN)],
      ],
      rePassword: ['', [Validators.required]],
    },
    { validators: passwordMatch }
  );

  get username() {
    return this.signUpForm.get('username') as FormControl;
  }

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
      this._auth
        .signUp(this.signUpForm.value as SignUpCredentials)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(({ token }) => this._auth.setToken(token));
    }
  }
}
