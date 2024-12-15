import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
@Component({
  selector: 'jfudali-admin-panel',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MenubarModule],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.scss',
})
export class AdminPanelComponent {
  sidebarVisible = true;
  navigation: MenuItem[] = [
    {
      label: 'Wyzywania',
      items: [
        {
          label: 'Lista',
          icon: 'pi pi-list',
          routerLink: '/admin/encounters',
        },
        {
          label: 'Dodaj',
          icon: 'pi pi-plus',
          routerLink: '/admin/encounters/add',
        },
      ],
    },
    {
      label: 'Przeciwnicy',
      items: [
        {
          label: 'Lista',
          routerLink: '/admin/enemies/',
        },
        {
          label: 'Dodaj',
          routerLink: '/admin/enemies/add',
        },
      ],
    },
    {
      label: 'Przedmioty',
      routerLink: '/admin/encounters',
      items: [
        {
          label: 'Dodaj',
          routerLink: '/admin/encounters/add',
        },
      ],
    },
  ];
}
