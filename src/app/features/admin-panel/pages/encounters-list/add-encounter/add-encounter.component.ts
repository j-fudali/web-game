import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'jfudali-add-encounter',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './add-encounter.component.html',
  styleUrl: './add-encounter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddEncounterComponent { }
