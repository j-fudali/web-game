import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { NavigationButtonsGroupComponent } from '../../../shared/ui/navigation-buttons-group/navigation-buttons-group.component';
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
export class HeaderComponent {
  onSignOut = output<void>();
  isLoggedIn = input.required<boolean>();
}
