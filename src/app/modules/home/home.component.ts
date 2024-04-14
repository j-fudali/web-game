import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
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
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  @ViewChild('about', { static: true }) aboutGame!: ElementRef<HTMLDivElement>;
  scrollToAboutGame() {
    this.aboutGame.nativeElement.scrollIntoView({
      behavior: 'smooth',
    });
  }
}
