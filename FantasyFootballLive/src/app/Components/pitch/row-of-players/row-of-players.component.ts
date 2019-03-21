import { Component, OnInit, Input } from '@angular/core';
import SoccerPlayer from 'src/app/Models/SoccerPlayer';

@Component({
  selector: 'app-row-of-players',
  templateUrl: './row-of-players.component.html',
  styleUrls: ['./row-of-players.component.scss']
})
export class RowOfPlayersComponent implements OnInit {
  @Input() players: SoccerPlayer[];

  constructor() { }

  ngOnInit() {
  }

}
