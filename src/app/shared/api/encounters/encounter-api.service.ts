import {
  HttpParams,
  HttpErrorResponse,
  HttpClient,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, catchError, of, throwError, Observable, tap } from 'rxjs';
import { Effect } from '../../interfaces/effect';
import {
  Encounter,
  EncounterOnDraw,
  EnemyEncounterDto,
} from '../../interfaces/encounter';
import { Enemy } from '../../interfaces/enemy';
import { Statistics } from '../../interfaces/statistics';
import { environment } from '../../../../environments/environment';
import { LoggerService } from '../../services/logger.service';
import { NewEncounterDto } from './model/new-encounter.dto';

@Injectable({
  providedIn: 'root',
})
export class EncounterApiService {
  private BASE_URL = environment.url + '/encounters';
  private logger = inject(LoggerService);
  private http = inject(HttpClient);
  private LOAD_RANDOM_ENCOUNTER_ERROR = 'Błąd podczas ładowania wyzwania';
  private SELECT_DECISION_ERROR = 'Błąd wyboru decyzji';
  private NEW_ENCOUNTER_ERROR = 'Błąd dodawania wyzwania';
  private NEW_ENCOUNTER_SUCCESS = 'Udało się dodać nowe wyzwanie';
  loadRandomEncounter(level: number) {
    return this.http
      .get<EncounterOnDraw>(this.BASE_URL + '/random', {
        params: new HttpParams().set('difficulty', level),
      })
      .pipe(
        map(encounter => {
          const enemyEncounter = encounter as EnemyEncounterDto;
          if (enemyEncounter.enemy === undefined) return encounter;
          const statistics: Statistics = {
            health: {
              actualValue: enemyEncounter.enemy.maxHealth,
              maximumValue: enemyEncounter.enemy.maxHealth,
            },
            powerPoints: {
              actualValue: enemyEncounter.enemy.maxPowerPoints,
              maximumValue: enemyEncounter.enemy.maxPowerPoints,
            },
            energy: { actualValue: 0, maximumValue: 0 },
          };
          const enemy: Enemy = { ...enemyEncounter.enemy, statistics };
          return {
            ...enemyEncounter,
            enemy,
          };
        }),
        catchError((err: HttpErrorResponse) => {
          this.logger.showErrorMessage(this.LOAD_RANDOM_ENCOUNTER_ERROR);
          return throwError(() => err);
        })
      );
  }
  selectDecision(encounterId: string, decision: string) {
    return this.http
      .post<Effect>(`${this.BASE_URL}/${encounterId}/select-decision`, {
        decisionText: decision,
      })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.logger.showErrorMessage(this.SELECT_DECISION_ERROR);
          return throwError(() => err);
        })
      );
  }
  getEncounters(): Observable<Encounter[]> {
    return this.http.get<Encounter[]>(this.BASE_URL).pipe(
      catchError((err: HttpErrorResponse) => {
        this.logger.showErrorMessage(this.SELECT_DECISION_ERROR);
        return throwError(() => err);
      })
    );
  }
  createEncounters(newEncounter: NewEncounterDto) {
    return this.http.post(this.BASE_URL, newEncounter).pipe(
      tap(() => this.logger.showSuccessMessage(this.NEW_ENCOUNTER_SUCCESS)),
      catchError(err => {
        this.logger.showErrorMessage(this.NEW_ENCOUNTER_ERROR);
        return throwError(() => err);
      })
    );
  }
}
