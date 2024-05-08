import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { CreateCharacter } from '../interfaces/create-character';
import { PlayerCharacter } from '../../../shared/interfaces/player-character';

@Injectable({
  providedIn: 'root',
})
export class CharacterCreationService {
  private http = inject(HttpClient);
  private baseUrl = environment.url + '/player-character';

  createCharacter(createCharacter: CreateCharacter) {
    const { name, image, characterClassId } = createCharacter;
    const formdata = new FormData();
    formdata.set('name', name);
    formdata.set('image', image);
    formdata.set('characterClassId', characterClassId);
    return this.http.post<PlayerCharacter>(this.baseUrl, formdata);
  }
}
