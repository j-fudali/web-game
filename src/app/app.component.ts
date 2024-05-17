import { Component, OnInit, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuItem, PrimeNGConfig } from 'primeng/api';
import { AuthService } from './shared/services/auth.service';
import { FooterComponent } from './core/layout/footer/footer.component';
import { HeaderComponent } from './core/layout/header/header.component';
import { ToastModule } from 'primeng/toast';
import { ThirdwebService } from './shared/services/thirdweb.service';
import { SidebarModule } from 'primeng/sidebar';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
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
  private _authService = inject(AuthService);
  private primengConfig = inject(PrimeNGConfig);
  private _thirdwebService = inject(ThirdwebService);
  isLoggedIn = this._authService.isLoggedIn;
  walletDataState = this._thirdwebService.state;
  connect$ = this._thirdwebService.connect$;
  sidebarVisible = false;
  navigations: MenuItem[] = [
    {
      label: 'Zaloguj się',
      routerLink: '/login',
    },
    {
      label: 'Stwórz konto',
      routerLink: '/sign-up',
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
    },
  ];
  navigationsList = computed(() =>
    this.isLoggedIn()
      ? this.navigations.slice(2)
      : this.navigations.slice(0, -1)
  );
  ngOnInit(): void {
    this.primengConfig.ripple = true;
    this._authService.verifyUserLoggedIn();
  }
  signOut() {
    this._authService.signOut();
  }
}
