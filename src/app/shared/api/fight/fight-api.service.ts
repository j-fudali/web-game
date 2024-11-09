import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { Fight } from '../../interfaces/fight';
import { LoggerService } from '../../services/logger.service';

@Injectable({
  providedIn: 'root',
})
export class FightApiService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private baseUrl = environment.url + '/fights';
  private FIGHT_SIMULATION_ERROR = 'Błąd symulacji walki';

  simulateFight(weaponDamage: number, armor: number): Observable<Fight> {
    return this.http.post<Fight>(this.baseUrl, { weaponDamage, armor }).pipe(
      catchError((err: HttpErrorResponse) => {
        this.logger.showErrorMessage(this.FIGHT_SIMULATION_ERROR);
        return throwError(() => err);
      })
    );
  }
}
