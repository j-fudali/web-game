import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'jfudali-navigation-buttons-group',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ButtonGroupModule,
    RouterModule,
    MenuModule,
  ],
  templateUrl: './navigation-buttons-group.component.html',
  styleUrl: './navigation-buttons-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationButtonsGroupComponent {
  isLoggedIn = input.required<boolean>();
  onSignOut = output<void>();
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
  ];
  navigationsList = computed(() =>
    this.isLoggedIn() ? this.navigations.slice(2) : this.navigations
  );
  signOut() {
    this.onSignOut.emit();
  }
}
