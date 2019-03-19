import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import FantasyPlayer from '../../Models/FantasyPlayer';
import { SoccerPlayerService } from 'src/app/Services/soccer-player/soccerplayer.service';
import { MainUserService } from 'src/app/Services/main-user/main-user.service';

@Component({
	selector: 'app-team',
	templateUrl: './team.page.html',
	styleUrls: [ './team.page.scss' ]
})
export class TeamPage implements OnInit {
	fantasyPlayer: FantasyPlayer;
	showSpinner: boolean = true;
	constructor(
		private storage: Storage,
		private soccerPlayerService: SoccerPlayerService,
		private mainUserService: MainUserService
	) {}

	ngOnInit() {
		this.fetchCurrentUser().then(() => (this.showSpinner = false));
		this.refresh();
	}

	async fetchCurrentUser() {
		return this.storage.get('user').then((user) => {
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

	refreshUser(event: { target: { complete: () => void } }) {
		this.refresh().then(() => event.target.complete());
	}

	async refresh() {
		await this.mainUserService
			.updateUser(this.fantasyPlayer.id);
		return await await this.fetchCurrentUser();
	}
}
