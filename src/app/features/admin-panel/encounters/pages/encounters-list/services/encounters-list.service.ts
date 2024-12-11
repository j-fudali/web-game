import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, shareReplay, tap } from 'rxjs';
import { EncounterApiService } from '../../../../../../shared/api/encounters/encounter-api.service';

@Injectable()
export class EncountersListService {
  private encountersService = inject(EncounterApiService);
  private encounters$ = this.encountersService
    .getEncounters()
    .pipe(shareReplay(1));
  private status$ = this.encounters$.pipe(map(() => 'completed'));
  encounters = toSignal(this.encounters$.pipe(map(res => res.content)), {
    initialValue: [],
  });
  page = toSignal(this.encounters$.pipe(map(res => res.number)), {
    initialValue: undefined,
  });
  pageSize = toSignal(
    this.encounters$.pipe(map(res => res.pageable.pageSize)),
    {
      initialValue: undefined,
    }
  );
  totalElements = toSignal(
    this.encounters$.pipe(map(res => res.totalElements)),
    {
      initialValue: undefined,
    }
  );
  status = toSignal(this.status$, {
    initialValue: 'loading',
  });
}
