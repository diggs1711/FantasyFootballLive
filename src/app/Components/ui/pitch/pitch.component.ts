import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';
import FantasyPlayer from 'src/app/Models/FantasyPlayer';

@Component({
	selector: 'app-pitch',
	templateUrl: './pitch.component.html',
	styleUrls: [ './pitch.component.scss' ]
})
export class PitchComponent implements OnInit {
	fantasyPlayer: FantasyPlayer;

	constructor(public navParams: NavParams) {
		this.fantasyPlayer = this.navParams.get('fantasyPlayer');
	}

	ngOnInit() {}

	// createPositionsArray() {
	//   if (pick.position < 12) {
	// 		fantasyPlayer.team[`${position}s`].push(newPlayer);
	// 	} else {
	// 		fantasyPlayer.team.Bench.push(newPlayer);
	// 	}
	// }
}
