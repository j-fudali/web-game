import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { PlayerCharacterDto } from '../player-character';
import { catchError, EMPTY, tap } from 'rxjs';
import { LoggerService } from 'app/shared/services/logger.service';
import { TEXTS } from '../texts/texts.const';

@Injectable({
  providedIn: 'root',
})
export class ItemsApiService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  equipItems(items: bigint[]) {
    return this.http
      .put<Pick<PlayerCharacterDto, 'equippedItems'>>(
        environment.url + '/player-character/equipped-items',
        {
          equippedItems: items.map(i => i.toString()),
        }
      )
      .pipe(
        tap(() =>
          this.logger.showSuccessMessage(TEXTS.ITEMS_EQUIP_ITEMS_SUCCESS)
        ),
        catchError(() => {
          this.logger.showErrorMessage(TEXTS.ITEMS_EQUIP_ITEMS_ERROR);
          return EMPTY;
        })
      );
  }
}
