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
import { GetEncountersResponse } from './model/get-encounters-response';
import { UpdateEncounterDto } from './model/update-encounter.dto';
import { EncounterDto } from './model/encounter.dto';

@Injectable({
  providedIn: 'root',
})
export class EncounterApiService {
  private BASE_URL = environment.url + '/encounters';
  private logger = inject(LoggerService);
  private http = inject(HttpClient);
  private LOAD_RANDOM_ENCOUNTER_ERROR = 'Błąd podczas ładowania wyzwania';
  private SELECT_DECISION_ERROR = 'Błąd wyboru decyzji';
  private ENCOUNTERS_LIST_ERROR = 'Błąd pobrania wyzwań';
  private NEW_ENCOUNTER_ERROR = 'Błąd dodawania wyzwania';
  private NEW_ENCOUNTER_SUCCESS = 'Udało się dodać nowe wyzwanie';
  private UPDATE_ENCOUNTER_ERROR = 'Błąd aktualizacji wyzwania';
  private UPDATE_ENCOUNTER_SUCCESS = 'Udało się zaktualizować wyzwanie';
  private DELETE_ENCOUNTER_ERROR = 'Błąd usuwania wyzwania';
  private DELETE_ENCOUNTER_SUCCESS = 'Udało się usunąć wyzwanie';
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
  getEncounters(page: number) {
    return this.http
      .get<GetEncountersResponse>(this.BASE_URL, {
        params: new HttpParams().set('page', page + 1),
      })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.logger.showErrorMessage(this.ENCOUNTERS_LIST_ERROR);
          return throwError(() => err);
        })
      );
  }
  getEncounter(id: string) {
    return this.http.get<EncounterDto>(this.BASE_URL + '/' + id);
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
  updateEncounter(id: string, updateEncounter: UpdateEncounterDto) {
    return this.http.patch(this.BASE_URL + '/' + id, updateEncounter).pipe(
      tap(() => this.logger.showSuccessMessage(this.UPDATE_ENCOUNTER_SUCCESS)),
      catchError(err => {
        this.logger.showErrorMessage(this.UPDATE_ENCOUNTER_ERROR);
        return throwError(() => err);
      })
    );
  }
  deleteEncounter(id: string) {
    return this.http.delete(this.BASE_URL + '/' + id).pipe(
      tap(() => this.logger.showSuccessMessage(this.DELETE_ENCOUNTER_SUCCESS)),
      catchError(err => {
        this.logger.showErrorMessage(this.DELETE_ENCOUNTER_ERROR);
        return throwError(() => err);
      })
    );
  }
}
