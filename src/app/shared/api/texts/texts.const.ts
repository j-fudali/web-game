import { HttpErrorResponse } from '@angular/common/http';

export const TEXTS = {
  AUTH_BAD_CREDENTIALS: 'Nie poprawne dane logowania',
  AUTH_DUPLICATE_ERROR: (err: HttpErrorResponse) =>
    `${
      (err.error.message as string).startsWith('E-mail')
        ? 'E-mail'
        : 'Portfel kryptwalutowy'
    } jest już w użyciu`,
  ENCOUNTERS_LOAD_RANDOM_ENCOUNTER_ERROR: 'Błąd podczas ładowania wyzwania',
  ENCOUNTERS_LOAD_RANDOM_ENCOUNTER_EMPTY_ERROR:
    'Brak dostępnych wyzwań. Spróbuj ponownie później',
  ENCOUNTERS_SELECT_DECISION_ERROR: 'Błąd wyboru decyzji',
  ENCOUNTERS_ENCOUNTERS_LIST_ERROR: 'Błąd pobrania wyzwań',
  ENCOUNTERS_NEW_ENCOUNTER_ERROR: 'Błąd dodawania wyzwania',
  ENCOUNTERS_NEW_ENCOUNTER_SUCCESS: 'Udało się dodać nowe wyzwanie',
  ENCOUNTERS_UPDATE_ENCOUNTER_ERROR: 'Błąd aktualizacji wyzwania',
  ENCOUNTERS_UPDATE_ENCOUNTER_SUCCESS: 'Udało się zaktualizować wyzwanie',
  ENCOUNTERS_DELETE_ENCOUNTER_ERROR: 'Błąd usuwania wyzwania',
  ENCOUNTERS_DELETE_ENCOUNTER_SUCCESS: 'Udało się usunąć wyzwanie',
  ENEMIES_GET_ENEMIES_ERROR: 'Błąd pobierania listy przeciwników',
  ENEMIES_GET_ENEMY_BY_ID_ERROR: 'Błąd pobierania przeciwnika',
  ENEMIES_CREATE_ENEMY_SUCCESS: 'Udało się dodać przeciwnika',
  ENEMIES_CREATE_ENEMY_ERROR: 'Błąd dodawania przeciwnika',
  ENEMIES_UPDATE_ENEMY_SUCCESS: 'Udało się zaktualizować przeciwnika',
  ENEMIES_UPDATE_ENEMY_ERROR: 'Błąd aktualizacji przeciwnika',
  ENEMIES_DELETE_ENEMY_SUCCESS: 'Udało się usunąć przeciwnika',
  ENEMIES_DELETE_ENEMY_ERROR: 'Błąd usuwania przeciwnika',
  PLAYER_CHARACTER_ALREADY_HAS_CHARACTER_ERROR: 'Posiadasz już postać',
  PLAYER_CHARACTER_CANNOT_CREATE_CHARACTER_ERROR: 'Posiadasz już postać',
  PLAYER_CHARACTER_CREATE_CHARACTER_SUCCESS: 'Udało Ci się utworzyć postać',
  PLAYER_CHARACTER_CHARACTER_LOAD_ERROR: 'Błąd pobierania postaci',
  PLAYER_CHARACTER_REST_ERROR: 'Błąd włączania trybu odpoczynku',
  PLAYER_CHARACTER_STOP_REST_ERROR: 'Błąd wyłączania trybu odpoczynku',
  PLAYER_CHARACTER_STOP_REST_SUCCESS: 'Odpoczynek ukończony pomyślnie',
  ITEMS_EQUIP_ITEMS_ERROR: 'Błąd zapisu przedmiotów',
  ITEMS_EQUIP_ITEMS_SUCCESS: 'Zmiany w ekwipunku zapisano',
};
