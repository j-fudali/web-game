import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private _messagesService = inject(MessageService);

  showErrorMessage(message: string) {
    this._messagesService.add({
      severity: 'error',
      summary: 'Błąd',
      detail: message,
    });
  }
  showSuccessMessage(message: string) {
    this._messagesService.add({
      severity: 'success',
      summary: 'Sukces',
      detail: message,
    });
  }
}
