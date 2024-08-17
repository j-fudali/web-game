import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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
import { PASSWORD_PATTERN } from '../../../../shared/constants/config.constants';
import { SignUpCredentials } from '../../../../shared/interfaces/sign-up-credentials';
import { AuthService } from '../../../../shared/services/auth.service';
import { passwordMatch } from '../../../../shared/validators/passwordMatch.validator';
import { ThirdwebService } from '../../../../shared/services/thirdweb.service';
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
  private fb = inject(FormBuilder);
  private _auth = inject(AuthService);
  private _thirdwebService = inject(ThirdwebService);
  signUpForm = this.fb.group(
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
      this._auth.signUp$.next({
        ...this.signUpForm.value,
        cryptoWallet: this._thirdwebService.state.data()?.account.address,
      } as SignUpCredentials);
    }
  }
}
