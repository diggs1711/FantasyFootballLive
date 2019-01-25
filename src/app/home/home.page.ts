import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
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
	playerLeaguesKey: string = 'player-leagues';

	constructor(
		private storage: Storage,
		private router: Router,
		private requestDataService: RequestDataService,
		private fplTeamService: FplTeamService
	) {}

	ngOnInit() {
		Promise.all([ this.checkForFantasyId(), this.getUpcomingFixtures() ])
			.then(([ id, bootstrap ]) => {
				let { next_event_fixtures: fixtures, teams } = bootstrap;

				this.createFixtureList(fixtures, teams);
				this.fantasyId = id;
				return id ? this.getPlayerData(id) : null;
			})
			.then((player) => this.updateUserData(this.fantasyId, player))
			.finally(() => (this.showSpinner = false));
	}

	createFixtureList(fixtures, teams) {
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
	}

	isAuthenticated() {}

	checkForFantasyId() {
		return this.storage.get(this.FANTASY_ID_KEY);
	}

	onFantasyIdEntered(id) {
		this.showSpinner = true;
		this.getPlayerData(id).then((player) => {
			this.updateUserData(id, player);
			this.showSpinner = false;
		});
	}

	updateUserData(id: number, player: FantasyPlayer) {
		this.storeFantasyId(id);
		this.storePlayerLeagues(player.leagues);
		this.fantasyPlayer = player;
		this.fantasyId = id;
	}

	storePlayerLeagues(leagues) {
		this.storage.set(this.playerLeaguesKey, leagues);
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
