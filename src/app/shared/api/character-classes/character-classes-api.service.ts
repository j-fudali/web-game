import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { CharacterClass } from '../../interfaces/character-class';

@Injectable({
  providedIn: 'root',
})
export class CharacterClassesApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.url + '/character-classes';

  getCharacterClasses() {
    return this.http.get<CharacterClass[]>(this.baseUrl);
  }
}
