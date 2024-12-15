import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LoggerService } from '../../services/logger.service';
import { NewEnemyDto } from './model/new-enemy.dto';
import { environment } from '../../../../environments/environment';
import { catchError, tap, throwError } from 'rxjs';
import { UpdateEnemyDto } from './model/update-enemy.dto';
import { Enemy } from '../../interfaces/enemy';
import { EnemyDto } from './model/enemy.dto';
import { Page } from '../../interfaces/page';

@Injectable({
  providedIn: 'root',
})
export class EnemiesApiService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private BASE_URL = environment.url + '/enemies';
  private GET_ENEMIES_ERROR = 'Błąd pobierania listy przeciwników';
  private GET_ENEMY_BY_ID_ERROR = 'Błąd pobierania przeciwnika';
  private CREATE_ENEMY_SUCCESS = 'Udało się dodać przeciwnika';
  private CREATE_ENEMY_ERROR = 'Błąd dodawania przeciwnika';
  private UPDATE_ENEMY_SUCCESS = 'Udało się zaktualizować przeciwnika';
  private UPDATE_ENEMY_ERROR = 'Błąd aktualizacji przeciwnika';
  private DELETE_ENEMY_SUCCESS = 'Udało się usunąć przeciwnika';
  private DELETE_ENEMY_ERROR = 'Błąd usuwania przeciwnika';

  getEnemies(page: number) {
    return this.http
      .get<Page<EnemyDto>>(this.BASE_URL, {
        params: new HttpParams().set('page', page + 1),
      })
      .pipe(
        catchError(err => {
          this.logger.showErrorMessage(this.GET_ENEMIES_ERROR);
          return throwError(() => err);
        })
      );
  }
  getEnemyById(id: string) {
    return this.http.get<EnemyDto>(`${this.BASE_URL}/${id}`).pipe(
      catchError(err => {
        this.logger.showErrorMessage(this.GET_ENEMY_BY_ID_ERROR);
        return throwError(() => err);
      })
    );
  }
  createEnemy(newEnemy: NewEnemyDto) {
    const formdata = this.toFormData(newEnemy);
    return this.http.post(this.BASE_URL, formdata).pipe(
      tap(() => this.logger.showSuccessMessage(this.CREATE_ENEMY_SUCCESS)),
      catchError(err => {
        this.logger.showErrorMessage(this.CREATE_ENEMY_ERROR);
        return throwError(() => err);
      })
    );
  }
  updateEnemy(id: string, updateEnemy: UpdateEnemyDto) {
    const formdata = this.toFormData(updateEnemy);
    return this.http.patch(`${this.BASE_URL}/${id}`, formdata).pipe(
      tap(() => this.logger.showSuccessMessage(this.UPDATE_ENEMY_SUCCESS)),
      catchError(err => {
        this.logger.showErrorMessage(this.UPDATE_ENEMY_ERROR);
        return throwError(() => err);
      })
    );
  }
  deleteEnemy(id: string) {
    return this.http.delete(`${this.BASE_URL}/${id}`).pipe(
      tap(() => this.logger.showSuccessMessage(this.DELETE_ENEMY_SUCCESS)),
      catchError(err => {
        this.logger.showErrorMessage(this.DELETE_ENEMY_ERROR);
        return throwError(() => err);
      })
    );
  }
  private toFormData(data: NewEnemyDto): FormData;
  private toFormData(data: UpdateEnemyDto): FormData;
  private toFormData(data: NewEnemyDto | UpdateEnemyDto): FormData {
    const formaData = new FormData();
    Object.keys(data).forEach((k: string) => {
      const val = data[k as keyof NewEnemyDto];
      if (typeof val === 'number') {
        formaData.set(k, val.toString());
        return;
      }
      if (val) formaData.set(k, val);
    });
    return formaData;
  }
}
