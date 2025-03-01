import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EnemiesListService } from './services/enemies-list.service';
import { CommonModule } from '@angular/common';
import { SectionTitleComponent } from '../../../../../shared/components/section-title/section-title.component';
import { DataViewModule, DataViewPageEvent } from 'primeng/dataview';
import { RouterLink } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { TEXTS } from '../../texts/texts.const';

@Component({
  selector: 'jfudali-enemies-list',
  standalone: true,
  imports: [
    CommonModule,
    SectionTitleComponent,
    DataViewModule,
    RouterLink,
    AvatarModule,
  ],
  providers: [EnemiesListService],
  templateUrl: './enemies-list.component.html',
  styleUrl: './enemies-list.component.scss',
})
export class EnemiesListComponent {
  private enemiesListService = inject(EnemiesListService);
  enemies = this.enemiesListService.enemies;
  pageSize = this.enemiesListService.pageSize;
  totalElements = this.enemiesListService.totalElements;
  texts = TEXTS;
  changePage(event: DataViewPageEvent) {
    this.enemiesListService.getEnemies$.next(event.first / event.rows);
  }
}
