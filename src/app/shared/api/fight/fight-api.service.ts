import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { LoggerService } from '../../services/logger.service';
import { FightDto } from './model';

@Injectable({
  providedIn: 'root',
})
export class FightApiService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private baseUrl = environment.url + '/fights';
  private FIGHT_SIMULATION_ERROR = 'Błąd symulacji walki';

  simulateFight(encounterId: string, weaponDamage: number, armor: number) {
    return this.http
      .post<FightDto>(`${this.baseUrl}?encounterId=${encounterId}`, {
        weaponDamage,
        armor,
      })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.logger.showErrorMessage(this.FIGHT_SIMULATION_ERROR);
          return throwError(() => err);
        })
      );
  }
}
