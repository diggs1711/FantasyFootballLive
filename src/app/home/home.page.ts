import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { FantasyPlayerService } from '../Services/fantasy-player.service';
import FantasyPlayer from '../Models/FantasyPlayer';
import { RequestDataService } from '../Services/FplData/fpl-data.service';
import { FplTeamService } from '../Services/FplTeamService/fpl-team-service.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.page.html',
	styleUrls: [ './home.page.scss' ]
})
export class HomePage implements OnInit {
	FANTASY_ID_KEY: string = 'fantasy_id';
	fantasyId: number = null;
	fantasyPlayer: FantasyPlayer;
	upcomingFixtures: [];
	showSpinner: boolean = true;

	constructor(
		private storage: Storage,
		private plt: Platform,
		private router: Router,
		private fantasyPlayerService: FantasyPlayerService,
		private requestDataService: RequestDataService,
		private fplTeamService: FplTeamService
	) {}

	ngOnInit() {
		Promise.all([ this.checkForFantasyId(), this.getUpcomingFixtures() ])
			.then(([ id, bootstrap ]) => {
				let { next_event_fixtures: fixtures, teams } = bootstrap;
				this.upcomingFixtures = fixtures.map((fixture) => {
					const homeTeam = this.getTeamName(teams, fixture.team_h);
					const awayTeam = this.getTeamName(teams, fixture.team_a);

					return {
						home_team: homeTeam,
						away_team: awayTeam,
						time: fixture.kickoff_time_formatted,
						badge_home: this.getBadge(homeTeam)
					};
				});

				this.fantasyId = id;
				return this.getPlayerData(id);
			})
			.then((player) => {
				this.fantasyPlayer = player;
				this.showSpinner = false;
			});
	}

	isAuthenticated() {}

	checkForFantasyId() {
		return this.storage.get(this.FANTASY_ID_KEY);
	}

	onFantasyIdEntered(id) {
		this.fantasyId = id;
		this.storeFantasyId(id);
	}

	storeFantasyId(id: number) {
		return this.storage.set(this.FANTASY_ID_KEY, id);
	}

	navigateTo(url: string) {
		this.router.navigateByUrl(`/tabs${url}`);
	}

	getPlayerData(id) {
		return this.fplTeamService.loadPlayer(id);
	}

	getUpcomingFixtures() {
		return this.requestDataService.getData('https://fantasy.premierleague.com/drf/bootstrap-static');
	}

	getBadge(team) {
		return `/assets/badges/${team}.png`;
	}

	getTeamName(teams, id) {
		return teams.find((team) => team.id === id).name;
	}
}
