import { inject, Injectable } from '@angular/core';
import { EncounterApiService } from '../../../../../../shared/api/encounters/encounter-api.service';
import {
  catchError,
  filter,
  map,
  merge,
  of,
  shareReplay,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { NewEncounterDto } from '../../../../../../shared/api/encounters/model/new-encounter.dto';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable()
export class AddEncounterService {
  private encountersApiService = inject(EncounterApiService);
  private error$ = new Subject<Error>();
  createEncounter$ = new Subject<NewEncounterDto>();
  private onCreateEncouter$ = this.createEncounter$.pipe(
    switchMap(data =>
      this.encountersApiService.createEncounters(data).pipe(
        catchError(err => {
          this.error$.next(err);
          return of(undefined);
        })
      )
    ),
    shareReplay(1)
  );
  private status$ = merge(
    this.createEncounter$.pipe(map(() => 'loading' as const)),
    this.onCreateEncouter$.pipe(
      filter(res => res !== undefined),
      map(() => 'success' as const)
    ),
    this.error$.pipe(map(() => 'error' as const))
  );
  status = toSignal(this.status$, { initialValue: null });
}
