import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  catchError,
  EMPTY,
  map,
  merge,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { EncounterApiService } from '../../../../../../shared/api/encounters/encounter-api.service';

@Injectable()
export class EncountersListService {
  private encountersService = inject(EncounterApiService);

  getEncounteres$ = new Subject<number>();
  private encounters$ = this.getEncounteres$.pipe(
    startWith(0),
    switchMap(page =>
      this.encountersService.getEncounters(page).pipe(catchError(() => EMPTY))
    ),
    shareReplay(1)
  );

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
}
