import {
  HttpParams,
  HttpErrorResponse,
  HttpClient,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, throwError, tap } from 'rxjs';
import { EffectDto } from './model/effect.dto';
import { LoggerService } from '../../services/logger.service';
import { NewEncounterDto } from './model/new-encounter.dto';
import { UpdateEncounterDto } from './model/update-encounter.dto';
import { EncounterDto } from './model/encounter.dto';
import { TEXTS } from '../texts/texts.const';
import { RandomEncounterDto } from './model/random-encounter.dto';
import { APP_CONFIG } from '@jfudali/shared/config';
import { EncountersDto } from './model/encounters.dto';
import { Page } from 'app/shared/interfaces/page';
import { SelectDecisionDto } from './model/select-decision.dto';

@Injectable({
  providedIn: 'root',
})
export class EncounterApiService {
  private appConfig = inject(APP_CONFIG);
  private BASE_URL = this.appConfig.url + '/encounters';
  private logger = inject(LoggerService);
  private http = inject(HttpClient);
  loadRandomEncounter(level: number) {
    return this.http
      .get<RandomEncounterDto>(this.BASE_URL + '/random', {
        params: new HttpParams().set('difficulty', level),
      })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.status == 409) {
            this.logger.showErrorMessage(
              TEXTS.ENCOUNTERS_LOAD_RANDOM_ENCOUNTER_EMPTY_ERROR
            );
          } else {
            this.logger.showErrorMessage(
              TEXTS.ENCOUNTERS_LOAD_RANDOM_ENCOUNTER_ERROR
            );
          }
          return throwError(() => err);
        })
      );
  }
  selectDecision(encounterId: string, decision: string) {
    return this.http
      .post<SelectDecisionDto>(
        `${this.BASE_URL}/${encounterId}/select-decision`,
        {
          decisionText: decision,
        }
      )
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.logger.showErrorMessage(TEXTS.ENCOUNTERS_SELECT_DECISION_ERROR);
          return throwError(() => err);
        })
      );
  }
  getEncounters(page: number) {
    return this.http
      .get<Page<EncountersDto>>(this.BASE_URL, {
        params: new HttpParams().set('page', page + 1),
      })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.logger.showErrorMessage(TEXTS.ENCOUNTERS_ENCOUNTERS_LIST_ERROR);
          return throwError(() => err);
        })
      );
  }
  getEncounter(id: string) {
    return this.http.get<EncounterDto>(this.BASE_URL + '/' + id);
  }
  createEncounters(newEncounter: NewEncounterDto) {
    return this.http.post(this.BASE_URL, newEncounter).pipe(
      tap(() =>
        this.logger.showSuccessMessage(TEXTS.ENCOUNTERS_NEW_ENCOUNTER_SUCCESS)
      ),
      catchError(err => {
        this.logger.showErrorMessage(TEXTS.ENCOUNTERS_NEW_ENCOUNTER_ERROR);
        return throwError(() => err);
      })
    );
  }
  updateEncounter(id: string, updateEncounter: UpdateEncounterDto) {
    return this.http.patch(this.BASE_URL + '/' + id, updateEncounter).pipe(
      tap(() =>
        this.logger.showSuccessMessage(
          TEXTS.ENCOUNTERS_UPDATE_ENCOUNTER_SUCCESS
        )
      ),
      catchError(err => {
        this.logger.showErrorMessage(TEXTS.ENCOUNTERS_UPDATE_ENCOUNTER_ERROR);
        return throwError(() => err);
      })
    );
  }
  deleteEncounter(id: string) {
    return this.http.delete(this.BASE_URL + '/' + id).pipe(
      tap(() =>
        this.logger.showSuccessMessage(
          TEXTS.ENCOUNTERS_DELETE_ENCOUNTER_SUCCESS
        )
      ),
      catchError(err => {
        this.logger.showErrorMessage(TEXTS.ENCOUNTERS_DELETE_ENCOUNTER_ERROR);
        return throwError(() => err);
      })
    );
  }
}
