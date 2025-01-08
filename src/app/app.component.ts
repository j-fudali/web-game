import {
  Component,
  DestroyRef,
  HostListener,
  OnInit,
  Signal,
  computed,
  inject,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuItem, PrimeNGConfig } from 'primeng/api';
import { AuthService } from './shared/services/auth.service';
import { FooterComponent } from './core/layout/footer/footer.component';
import { HeaderComponent } from './core/layout/header/header.component';
import { ToastModule } from 'primeng/toast';
import { SidebarModule } from 'primeng/sidebar';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ThirdwebService } from './shared/thirdweb/thirdweb.service';
import { EMPTY, switchMap, tap } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoaderService } from './shared/features/loader/loader.service';
import { PlayerCharacterService } from './features/game/services/player-character.service';
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
    ProgressSpinnerModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth > 992) {
      this.sidebarVisible = false;
    }
  }
  private destroyRef = inject(DestroyRef);
  private loaderService = inject(LoaderService);
  private _thirdwebService = inject(ThirdwebService);
  private _authService = inject(AuthService);
  private primengConfig = inject(PrimeNGConfig);
  showLoader = toSignal(this.loaderService.getVisible$(), {
    initialValue: false,
  });
  sidebarVisible = false;
  isLoggedIn = toSignal(this._authService.getIsLoggedIn$(), {
    initialValue: this._authService.getIsLoggedIn(),
  });
  navigationsList: Signal<MenuItem[]> = computed(() => [
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
      label: 'Sklep ze skrzyniami',
      routerLink: '/lootboxes',
    },
    {
      label: 'Otwórz rynek',
      routerLink: '/marketplace',
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
    this._thirdwebService
      .getIsDisconnected$()
      .pipe(
        switchMap(val => (!val ? this._thirdwebService.autoConnect() : EMPTY)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }
  connect(): void {
    this._thirdwebService.connect().pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe;
  }
  signOut() {
    this._authService.signOut();
  }
  disconnectWallet() {
    this._thirdwebService
      .disconnect()
      .pipe(
        tap(() => this.signOut()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }
}
