import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { PlayerCharacterService } from './services/player-character.service';

@Component({
  selector: 'jfudali-game',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private _playerCharacterService = inject(PlayerCharacterService);
  ngOnInit(): void {
    this._playerCharacterService.init(
      this.route.snapshot.data['playerCharacter']
    );
  }
}
