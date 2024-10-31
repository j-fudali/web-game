import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { PlayerCharacter } from '../../interfaces/player-character';
import { environment } from '../../../../environments/environment.development';
import { LoggerService } from '../../services/logger.service';
import { catchError, of, throwError } from 'rxjs';
import { CreateCharacter } from '../../../features/game/interfaces/create-character';
import { AuthService } from '../../services/auth.service';
import { RestData } from '../../interfaces/rest-data';

@Injectable({
  providedIn: 'root',
})
export class PlayerCharacterApiService {
  private BASE_URL = environment.url + '/player-character';
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private _authService = inject(AuthService);
  private ALREADY_HAS_CHARACTER_ERROR = 'Posiadasz już postać';
  private CANNOT_CREATE_CHARACTER_ERROR = 'Posiadasz już postać';
  private CHARACTER_NOT_FOUND_ERROR = 'Nieznaleziono postaci';
  private REST_ERROR = 'Błąd włączania trybu odpoczynku';
  private STOP_REST_ERROR = 'Błąd włączania trybu odpoczynku';
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
    return this.http.post<PlayerCharacter>(this.BASE_URL, formdata).pipe(
      catchError(err => {
        if (err.status == 409) {
          this.logger.showErrorMessage(this.ALREADY_HAS_CHARACTER_ERROR);
        } else {
          this.logger.showErrorMessage(this.CANNOT_CREATE_CHARACTER_ERROR);
        }
        return of(undefined);
      })
    );
  }
  getPlayerCharacter() {
    return this.http.get<PlayerCharacter>(this.BASE_URL).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status == 404) {
          this.logger.showErrorMessage(this.CHARACTER_NOT_FOUND_ERROR);
          this._authService.signOut$.next();
        }
        return of(undefined);
      })
    );
  }
  rest() {
    return this.http.post<RestData>(this.BASE_URL + '/rest', {}).pipe(
      catchError((err: HttpErrorResponse) => {
        this.logger.showErrorMessage(this.REST_ERROR);
        return of(undefined);
      })
    );
  }
  stopRest() {
    return this.http.delete(this.BASE_URL + '/rest/stop').pipe(
      catchError((err: HttpErrorResponse) => {
        this.logger.showErrorMessage(this.STOP_REST_ERROR);
        return of(undefined);
      })
    );
  }
}
