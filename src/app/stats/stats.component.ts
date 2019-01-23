import { Component, OnInit } from '@angular/core';
import { RequestDataService } from '../Services/FplData/fpl-data.service';
@Component({
	selector: 'app-stats',
	templateUrl: './stats.component.html',
	styleUrls: [ './stats.component.scss' ]
})
export class StatsComponent implements OnInit {
	fixtures: any;
	bootstrapData: {};
	fixtureRange: number;
	originalFixtures: any;
	teams: any;

	constructor(private fplDataService: RequestDataService) {
		this.teams = {};
		this.fixtures = [];
		this.bootstrapData = {};
		this.fixtureRange = 6;

		Promise.all([ this.getBootstrapData(), this.getFixtures() ]).then(([ bootstrap, fixtures ]) => {
			this.bootstrapData = bootstrap;
			const fix = fixtures.filter((fixture) => !fixture.finished);
			this.createMapOfUpcomingFixtures(fix);
		});
	}

	ngOnInit() {}

	/**
     * 
     * @param fixtures array of upcoming fixtures
     */
	createMapOfUpcomingFixtures(upcomingFixures) {
		upcomingFixures.map((fixture) => {
			let homeTeam = this.getTeamName(fixture.team_h);
			let awayTeam = this.getTeamName(fixture.team_a);

			this.fixtures[fixture.team_h - 1] = this.fixtures[fixture.team_h - 1] || [];
			this.fixtures[fixture.team_a - 1] = this.fixtures[fixture.team_a - 1] || [];

			this.fixtures[fixture.team_h - 1].push({
				venue: 'home',
				difficulty: fixture.team_h_difficulty,
				opponent: awayTeam,
				team_name: homeTeam
			});

			this.fixtures[fixture.team_a - 1].push({
				venue: 'away',
				difficulty: fixture.team_a_difficulty,
				opponent: homeTeam,
				team_name: awayTeam
			});
		});
	}

	rankTeams() {
		this.originalFixtures = this.fixtures.splice();

		this.fixtures.map((team) => {
			team.totalDifficulty = team.reduce((a, b) => {
				return a + b.difficulty;
			}, 0);
		});

		this.fixtures.sort((a, b) => a.totalDifficulty - b.totalDifficulty);
	}

	getTeamName(id): string {
		if (id < 1 || id > 20) return;
		return this.bootstrapData['teams'].find((team) => team.id == id).name;
	}

	/**
     * 
     * @param id FPL start their Team ids at 1 and using an array to sort teams is awkward as it starts at 0 index
     */
	getTeamNameStartingAtZeroIndex(id) {
		return this.getTeamName(id + 1);
	}

	/**
     * Returns bootstrap data from fpl. Includes teams, current gameweek, players
     */
	getBootstrapData() {
		return this.fplDataService.getData('https://fantasy.premierleague.com/drf/bootstrap');
	}

	/**
     * Get all the fixtures played this year
     */
	getFixtures() {
		return this.fplDataService.getData('https://fantasy.premierleague.com/drf/fixtures/');
	}
}
