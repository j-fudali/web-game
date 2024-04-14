import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';

@Component({
  selector: 'jfudali-navigation-buttons-group',
  standalone: true,
  imports: [CommonModule, ButtonModule, ButtonGroupModule, RouterModule],
  templateUrl: './navigation-buttons-group.component.html',
  styleUrl: './navigation-buttons-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationButtonsGroupComponent {}
