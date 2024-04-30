import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';
import { AuthService } from './shared/services/auth.service';
import { FooterComponent } from './shared/ui/footer/footer.component';
import { HeaderComponent } from './shared/ui/header/header.component';
@Component({
  selector: 'jfudali-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private _auth = inject(AuthService);
  private primengConfig = inject(PrimeNGConfig);
  isLoggedIn = this._auth.isLoggedIn;
  ngOnInit(): void {
    this.primengConfig.ripple = true;
    this._auth.verifyUserLoggedIn();
  }
  signOut() {
    this._auth.signOut();
  }
}
