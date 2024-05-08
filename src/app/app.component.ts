import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';
import { AuthService } from './shared/services/auth.service';
import { FooterComponent } from './core/layout/footer/footer.component';
import { HeaderComponent } from './core/layout/header/header.component';
import { ToastModule } from 'primeng/toast';
import { PlayerService } from './shared/services/player.service';
@Component({
  selector: 'jfudali-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private _authService = inject(AuthService);
  private primengConfig = inject(PrimeNGConfig);
  isLoggedIn = this._authService.isLoggedIn;
  ngOnInit(): void {
    this.primengConfig.ripple = true;
    this._authService.verifyUserLoggedIn();
  }
  signOut() {
    this._authService.signOut();
  }
}
