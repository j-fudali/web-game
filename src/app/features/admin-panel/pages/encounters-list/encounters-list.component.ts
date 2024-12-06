import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DataViewModule } from 'primeng/dataview';

@Component({
  selector: 'jfudali-encounters-list',
  standalone: true,
  imports: [CommonModule, DataViewModule],
  templateUrl: './encounters-list.component.html',
  styleUrl: './encounters-list.component.scss',
})
export class EncountersListComponent {}
