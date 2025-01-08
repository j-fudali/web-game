import { Injectable, inject } from '@angular/core';
import { CharacterClassesApiService } from '../api/character-classes/character-classes-api.service';
import { CharacterClassDto } from '../api/character-classes/model/character-class.dto';
import { map, Observable, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CharacterClassesService {
  private _characterClasssesApiService = inject(CharacterClassesApiService);
  private characterClasses$: Observable<CharacterClassDto[]>;
  constructor() {
    this.initCharacterClasses();
  }
  getCharacterClasses$(): Observable<CharacterClassDto[]> {
    return this.characterClasses$;
  }
  private initCharacterClasses(): void {
    this.characterClasses$ = this._characterClasssesApiService
      .getCharacterClasses()
      .pipe(shareReplay(1));
  }
}
