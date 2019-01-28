import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import FantasyPlayer from '../../Models/FantasyPlayer';
import { SoccerPlayerService } from 'src/app/Services/SoccerPlayerService/soccerplayer.service';

@Component({
	selector: 'app-team',
	templateUrl: './team.page.html',
	styleUrls: [ './team.page.scss' ]
})
export class TeamPage implements OnInit {
	fantasyPlayer: FantasyPlayer;
	constructor(private storage: Storage, private soccerPlayerService: SoccerPlayerService) {}

	ngOnInit() {
		this.storage.get('user').then((user) => {
			this.fantasyPlayer = user;

			for (const player of this.fantasyPlayer.team.Goalkeepers) {
				this.soccerPlayerService
					.getUpcomingFixtures(player.id)
					.then((fixtures) => (player.fixtures = fixtures));
			}

			for (const player of this.fantasyPlayer.team.Defenders) {
				this.soccerPlayerService
					.getUpcomingFixtures(player.id)
					.then((fixtures) => (player.fixtures = fixtures));
			}

			for (const player of this.fantasyPlayer.team.Midfielders) {
				this.soccerPlayerService
					.getUpcomingFixtures(player.id)
					.then((fixtures) => (player.fixtures = fixtures));
			}

			for (const player of this.fantasyPlayer.team.Forwards) {
				this.soccerPlayerService
					.getUpcomingFixtures(player.id)
					.then((fixtures) => (player.fixtures = fixtures));
			}

			for (const player of this.fantasyPlayer.team.Bench) {
				this.soccerPlayerService
					.getUpcomingFixtures(player.id)
					.then((fixtures) => (player.fixtures = fixtures));
			}
		});
	}
}
