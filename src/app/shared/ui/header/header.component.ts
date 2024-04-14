import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { NavigationButtonsGroupComponent } from '../navigation-buttons-group/navigation-buttons-group.component';
@Component({
  selector: 'jfudali-header',
  standalone: true,
  imports: [
    CommonModule,
    ToolbarModule,
    NgOptimizedImage,
    NavigationButtonsGroupComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {}
