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
import { toSignal } from '@angular/core/rxjs-interop';
import { UpdateEncounterDto } from '../../../../../../shared/api/encounters/model/update-encounter.dto';
import { Router } from '@angular/router';

@Injectable()
export class EncounterDetailsService {
  private router = inject(Router);
  private encountersApiService = inject(EncounterApiService);
  private error$ = new Subject<Error>();
  getEncounter$ = new Subject<string>();
  updateEncounter$ = new Subject<{ id: string; data: UpdateEncounterDto }>();
  deleteEncounter$ = new Subject<string>();

  private onDeleteEncounter$ = this.deleteEncounter$.pipe(
    switchMap(id =>
      this.encountersApiService.deleteEncounter(id).pipe(
        tap(() => this.router.navigate(['../'])),
        catchError(err => {
          this.error$.next(err);
          return of(undefined);
        })
      )
    )
  );
  private onUpdateEncounter$ = this.updateEncounter$.pipe(
    switchMap(({ id, data }) =>
      this.encountersApiService.updateEncounter(id, data).pipe(
        catchError(err => {
          this.error$.next(err);
          return of(undefined);
        })
      )
    ),
    shareReplay(1)
  );
  private onGetEncounter$ = this.getEncounter$.pipe(
    switchMap(id =>
      this.encountersApiService.getEncounter(id).pipe(
        catchError(err => {
          this.error$.next(err);
          return of(undefined);
        })
      )
    ),
    shareReplay(1)
  );
  private status$ = merge(
    this.getEncounter$.pipe(map(() => 'loading' as const)),
    this.onGetEncounter$.pipe(
      filter(res => res !== undefined),
      map(() => 'completed' as const)
    ),
    this.updateEncounter$.pipe(map(() => 'update-loading')),
    this.onUpdateEncounter$.pipe(
      filter(res => res !== undefined),
      map(() => 'update-success')
    ),
    this.deleteEncounter$.pipe(map(() => 'delete-loading')),
    this.onDeleteEncounter$.pipe(
      filter(res => res !== undefined),
      map(() => 'delete-success')
    )
  );
  encounter = toSignal(this.onGetEncounter$, { initialValue: undefined });
  status = toSignal(this.status$, { initialValue: null });
  error = toSignal(this.error$, { initialValue: null });
}
