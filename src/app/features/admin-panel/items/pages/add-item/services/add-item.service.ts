import { inject, Injectable } from '@angular/core';
import { ThirdwebService } from '../../../../../../shared/thirdweb/thirdweb.service';
import {
  filter,
  Subject,
  switchMap,
  combineLatest,
  catchError,
  shareReplay,
  merge,
  map,
  of,
} from 'rxjs';
import { NewItem } from '../../../../../../shared/thirdweb/model/new-item.model';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable()
export class AddItemService {
  private thirdwebService = inject(ThirdwebService);

  addItem$ = new Subject<NewItem>();

  private onAddItem$ = this.addItem$.pipe(
    switchMap(item => this.thirdwebService.createItem(item)),
    shareReplay(1)
  );
  private status$ = merge(
    this.addItem$.pipe(map(() => 'loading' as const)),
    this.onAddItem$.pipe(
      filter(res => res !== undefined),
      map(() => 'success' as const)
    )
  );
  status = toSignal(this.status$, { initialValue: null });
}
