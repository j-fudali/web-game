import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { AnimateOnScrollModule } from 'primeng/animateonscroll';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
@Component({
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    DividerModule,
    AnimateOnScrollModule,
    CardModule,
    ButtonModule,
  ],
  templateUrl: './start.component.html',
  styleUrl: './start.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StartComponent {
  @ViewChild('about', { static: true }) aboutGame!: ElementRef<HTMLDivElement>;
  scrollToAboutGame() {
    this.aboutGame.nativeElement.scrollIntoView({
      behavior: 'smooth',
    });
  }
}
