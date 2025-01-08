import { inject, Injectable } from '@angular/core';
import { ThirdwebService } from '../../../../../../shared/thirdweb/thirdweb.service';
import {
  catchError,
  EMPTY,
  filter,
  map,
  merge,
  of,
  shareReplay,
  Subject,
  switchMap,
} from 'rxjs';
import { ItemMapper } from '../../../../../../shared/utils/item-mapper';
import { toSignal } from '@angular/core/rxjs-interop';
import { UpdateItem } from '../../../../../../shared/thirdweb/model/update-item.model';

@Injectable()
export class ItemDetailsService {
  private thirdwebService = inject(ThirdwebService);
  private error$ = new Subject<Error>();
  getItem$ = new Subject<number>();
  updateItem$ = new Subject<{
    id: bigint;
    updateItem: UpdateItem;
  }>();
  private onGetItem$ = this.getItem$.pipe(
    switchMap(id =>
      this.thirdwebService.getItemById(id).pipe(
        map(nft => ItemMapper.convertNftToItem(nft)),
        catchError(() => of(undefined))
      )
    ),
    shareReplay(1)
  );

  private OnUpdateItem$ = this.updateItem$.pipe(
    switchMap(({ id, updateItem }) =>
      this.thirdwebService.updateItem(id, updateItem)
    )
  );
  private status$ = merge(
    this.getItem$.pipe(map(() => 'loading' as const)),
    this.onGetItem$.pipe(
      filter(res => !!res),
      map(() => 'completed' as const)
    ),
    this.updateItem$.pipe(map(() => 'update-loading' as const)),
    this.OnUpdateItem$.pipe(
      filter(res => res !== undefined),
      map(() => 'update-success' as const)
    ),
    this.error$.pipe(map(() => 'error' as const))
  );
  item = toSignal(
    this.onGetItem$.pipe(map(data => (data ? data : undefined))),
    {
      initialValue: undefined,
    }
  );
  status = toSignal(this.status$, { initialValue: 'loading' as const });
}
