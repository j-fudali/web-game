import { Injectable, inject } from '@angular/core';
import { EncounterApiService } from '../../../../../shared/api/encounters/encounter-api.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private encountersService = inject(EncounterApiService);

  private encounters$ = this.encountersService.getEncounters();
}
