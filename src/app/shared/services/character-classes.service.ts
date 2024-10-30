import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { toSignal } from '@angular/core/rxjs-interop';
import { CharacterClass } from '../interfaces/character-class';
import { take, tap } from 'rxjs';
import { CharacterClassesApiService } from '../api/character-classes/character-classes-api.service';

@Injectable({
  providedIn: 'root',
})
export class CharacterClassesService {
  private _characterClasssesApiService = inject(CharacterClassesApiService);
  private characterClasses$ =
    this._characterClasssesApiService.getCharacterClasses();
  characterClasses = toSignal<CharacterClass[], CharacterClass[]>(
    this.characterClasses$,
    {
      initialValue: [],
    }
  );
}
