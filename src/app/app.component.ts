import {
  Component,
  HostListener,
  OnInit,
  Signal,
  WritableSignal,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuItem, PrimeNGConfig } from 'primeng/api';
import { AuthService } from './shared/services/auth.service';
import { FooterComponent } from './core/layout/footer/footer.component';
import { HeaderComponent } from './core/layout/header/header.component';
import { ToastModule } from 'primeng/toast';
import { SidebarModule } from 'primeng/sidebar';
import { Menu, MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { ThirdwebService } from './shared/services/thirdweb.service';
@Component({
  selector: 'jfudali-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    ToastModule,
    SidebarModule,
    ButtonModule,
    MenuModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (window.innerWidth > 992) {
      this.sidebarVisible = false;
    }
  }
  private _authService = inject(AuthService);
  private primengConfig = inject(PrimeNGConfig);
  private _thirdwebService = inject(ThirdwebService);
  isLoggedIn = this._authService.state.isLogged;
  error = this._authService.state.error;
  status = this._authService.state.status;
  walletDataState = this._thirdwebService.state;
  connect$ = this._thirdwebService.connect$;
  sidebarVisible = false;
  navigationsList = computed(() => [
    {
      label: 'Zaloguj się',
      routerLink: '/login',
      visible: !this.isLoggedIn(),
    },
    {
      label: 'Stwórz konto',
      routerLink: '/sign-up',
      visible: !this.isLoggedIn(),
    },
    {
      label: 'Otwórz rynek',
      routerLink: '/',
    },
    {
      label: 'Wyloguj',
      command: () => {
        this.signOut();
      },
      visible: this.isLoggedIn(),
    },
  ]);

  ngOnInit(): void {
    this.primengConfig.ripple = true;
  }
  signOut() {
    this._authService.signOut$.next();
  }
  disconnectWallet() {
    this._thirdwebService.disconnect$.next();
    this.signOut();
  }
}
