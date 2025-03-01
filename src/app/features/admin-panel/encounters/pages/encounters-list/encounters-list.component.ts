import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DataViewModule, DataViewPageEvent } from 'primeng/dataview';
import { EncountersListService } from './services/encounters-list.service';
import { RouterLink } from '@angular/router';
import { DividerModule } from 'primeng/divider';
import { SectionTitleComponent } from '../../../../../shared/components/section-title/section-title.component';
import { TEXTS } from '../../texts/texts.const';

@Component({
  selector: 'jfudali-encounters-list',
  standalone: true,
  imports: [
    CommonModule,
    DataViewModule,
    RouterLink,
    DividerModule,
    SectionTitleComponent,
  ],
  providers: [EncountersListService],
  templateUrl: './encounters-list.component.html',
  styleUrl: './encounters-list.component.scss',
})
export class EncountersListComponent {
  private encountersListService = inject(EncountersListService);
  encounters = this.encountersListService.encounters;
  page = this.encountersListService.page;
  pageSize = this.encountersListService.pageSize;
  totalElements = this.encountersListService.totalElements;
  texts = TEXTS;
  changePage(event: DataViewPageEvent) {
    this.encountersListService.getEncounteres$.next(event.first / event.rows);
  }
}
