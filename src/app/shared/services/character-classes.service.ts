import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { toSignal } from '@angular/core/rxjs-interop';
import { CharacterClass } from '../interfaces/character-class';
import { take, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CharacterClassesService {
  private http = inject(HttpClient);
  private baseUrl = environment.url + '/character-classes';

  private characterClasses$ = this.http
    .get<CharacterClass[]>(this.baseUrl)
    .pipe(take(1));
  characterClasses = toSignal<CharacterClass[], CharacterClass[]>(
    this.characterClasses$,
    {
      initialValue: [],
    }
  );
}
