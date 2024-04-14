import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { AnimateOnScrollModule } from 'primeng/animateonscroll';
import { CardModule } from 'primeng/card';
import { FooterComponent } from '../../shared/ui/footer/footer.component';
import { ButtonModule } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';
@Component({
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    DividerModule,
    AnimateOnScrollModule,
    CardModule,
    ButtonModule,
    ButtonGroupModule,
    FooterComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
