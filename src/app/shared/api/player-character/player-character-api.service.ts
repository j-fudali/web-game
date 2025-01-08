import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  PlayerCharacterApiResponse,
  PlayerCharacterDto,
} from './model/player-character.dto';
import { environment } from '../../../../environments/environment.development';
import { LoggerService } from '../../services/logger.service';
import { catchError, EMPTY, of, shareReplay, tap, throwError } from 'rxjs';
import { CreateCharacter } from '../../../features/game/interfaces/create-character';
import { RestDataDto } from './model/rest-data.dto';
import { TEXTS } from '../texts/texts.const';

@Injectable({
  providedIn: 'root',
})
export class PlayerCharacterApiService {
  private BASE_URL = environment.url + '/player-character';
  private http = inject(HttpClient);
  private logger = inject(LoggerService);

  createCharacter({
    name,
    image,
    characterClassId,
    equippedItems,
  }: CreateCharacter) {
    const formdata = new FormData();
    formdata.set('name', name);
    formdata.set('image', image);
    formdata.set('characterClassId', characterClassId);
    formdata.set('equippedItems[]', equippedItems[0]);
    return this.http.post<PlayerCharacterDto>(this.BASE_URL, formdata).pipe(
      tap(() =>
        this.logger.showSuccessMessage(
          TEXTS.PLAYER_CHARACTER_CREATE_CHARACTER_SUCCESS
        )
      ),
      catchError(err => {
        if (err.status == 409) {
          this.logger.showErrorMessage(
            TEXTS.PLAYER_CHARACTER_ALREADY_HAS_CHARACTER_ERROR
          );
        } else {
          this.logger.showErrorMessage(
            TEXTS.PLAYER_CHARACTER_CANNOT_CREATE_CHARACTER_ERROR
          );
        }
        return EMPTY;
      })
    );
  }
  getPlayerCharacter() {
    return this.http.get<PlayerCharacterApiResponse>(this.BASE_URL).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status != 404) {
          this.logger.showErrorMessage(
            TEXTS.PLAYER_CHARACTER_CHARACTER_LOAD_ERROR
          );
        }
        return throwError(() => err);
      })
    );
  }
  rest() {
    return this.http.post<RestDataDto>(this.BASE_URL + '/rest', {}).pipe(
      catchError(() => {
        this.logger.showErrorMessage(TEXTS.PLAYER_CHARACTER_REST_ERROR);
        return EMPTY;
      })
    );
  }
  stopRest(endTime: Date) {
    return this.http
      .delete<void>(this.BASE_URL + '/rest/stop', {
        params: new HttpParams().set('endTime', endTime.toISOString()),
      })
      .pipe(
        tap(() =>
          this.logger.showSuccessMessage(
            TEXTS.PLAYER_CHARACTER_STOP_REST_SUCCESS
          )
        ),
        catchError(() => {
          this.logger.showErrorMessage(TEXTS.PLAYER_CHARACTER_STOP_REST_ERROR);
          return EMPTY;
        })
      );
  }
}
