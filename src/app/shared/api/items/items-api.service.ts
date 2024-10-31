import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { PlayerCharacter } from '../../interfaces/player-character';

@Injectable({
  providedIn: 'root',
})
export class ItemsApiService {
  private http = inject(HttpClient);

  equipItems(items: bigint[]) {
    return this.http.put<Pick<PlayerCharacter, 'equippedItems'>>(
      environment.url + '/player-character/equipped-items',
      {
        equippedItems: items.map(i => i.toString()),
      }
    );
  }
}
