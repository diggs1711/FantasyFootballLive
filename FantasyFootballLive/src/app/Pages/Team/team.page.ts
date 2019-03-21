import { Component, OnInit } from '@angular/core';

import { LiveDataService } from 'src/app/Services/live-data/live.data.service';
import { MainUserService } from 'src/app/Services/main-user/main-user.service';
import SoccerPlayer from 'src/app/Models/SoccerPlayer';
import { SoccerPlayerService } from 'src/app/Services/soccer-player/soccerplayer.service';

@Component({
	selector: 'app-team',
	templateUrl: './team.page.html',
	styleUrls: [ './team.page.scss' ]
})
export class TeamPage implements OnInit {
	showSpinner: boolean = true;
	constructor(
		private soccerPlayerService: SoccerPlayerService,
		private mainUserService: MainUserService,
		private liveDataService: LiveDataService
	) {}

	ngOnInit() {
		this.mainUserService.loadSavedUser()
			.then(() => this.loadUpcomingFixtures())
			.then(() => (this.showSpinner = false))
			.then(() => this.refresh());
	}

	loadFixtures(players: SoccerPlayer[]) {
		for (const player of players) {
			this.soccerPlayerService
				.getUpcomingFixtures(player.id)
				.then((fixtures) => (player.fixtures = fixtures));
		}
	}

	loadUpcomingFixtures() {
		this.loadFixtures(this.mainUserService.user.team.Goalkeepers)
		this.loadFixtures(this.mainUserService.user.team.Defenders)
		this.loadFixtures(this.mainUserService.user.team.Midfielders)
		this.loadFixtures(this.mainUserService.user.team.Forwards)
		this.loadFixtures(this.mainUserService.user.team.Bench)
	}

	refreshUser(event: { target: { complete: () => void } }) {
		this.refresh().then(() => event.target.complete());
	}

	async refresh() {
		//this.liveDataService.refresh()
	}
}
