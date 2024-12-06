import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { PanelModule } from 'primeng/panel';
import { PanelMenuModule } from 'primeng/panelmenu';
@Component({
  selector: 'jfudali-admin-panel',
  standalone: true,
  imports: [CommonModule, RouterOutlet, PanelMenuModule],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.scss',
})
export class AdminPanelComponent {
  sidebarVisible = true;
  navigation: MenuItem[] = [
    {
      label: 'Wyzywania',
      routerLink: '/admin/encounters',
      items: [
        {
          label: 'Dodaj',
          icon: 'pi pi-plus',
          routerLink: '/admin/encounters/add',
        },
      ],
    },
    {
      label: 'Przeciwnicy',
      // routerLink: '/admin/encounters',
      items: [
        {
          label: 'Dodaj',
          // routerLink: '/admin/encounters/add',
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
