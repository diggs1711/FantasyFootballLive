import { Component, OnInit } from '@angular/core';
import { HttpRequestService } from 'src/app/Services/http-request/http-request.service';
import { StaticDataService } from 'src/app/Services/static-data/static.data.service';

@Component({
	selector: 'app-stats',
	templateUrl: './stats.page.html',
	styleUrls: [ './stats.page.scss' ]
})
export class StatsPage implements OnInit {
	teamFixtures: any = new Map();
	teamFixturesAll: any = new Map();
	fixtureDifficulty: Map<string, number> = new Map();
	bootstrapData: {};
	fixtureRange: number = 6;
	originalFixtures: any;
	teams: any;

	constructor(private fplDataService: HttpRequestService, private staticDataService: StaticDataService) {}

	ngOnInit() {
		Promise.all([ this.staticDataService.getBootstrapData(), this.getFixtures() ])
			.then(([ bootstrap, fixtures ]) => {
				this.bootstrapData = bootstrap;
				const upcomingFixtures = fixtures.filter((fixture) => !fixture.finished);
				this.createMapOfUpcomingFixtures(upcomingFixtures);
			})
			.then(() => this.updateRank());
	}

	/**
     * 
     * @param fixtures array of upcoming fixtures
     */
	createMapOfUpcomingFixtures(upcomingFixures: any[]) {
		upcomingFixures.map((fixture) => {
			let homeTeam = this.getTeamName(fixture.team_h);
			let awayTeam = this.getTeamName(fixture.team_a);

			const homeFixture = {
				venue: 'home',
				difficulty: fixture.team_h_difficulty,
				opponent: awayTeam,
				team_name: homeTeam
			};

			const awayFixure = {
				venue: 'away',
				difficulty: fixture.team_a_difficulty,
				opponent: homeTeam,
				team_name: awayTeam
			};
			const homeTeamFixtures = this.teamFixturesAll.get(homeTeam) || [];
			let homeTeamDifficulty = this.fixtureDifficulty.get(homeTeam) || 0;

			homeTeamFixtures.push(homeFixture);
			this.teamFixturesAll.set(homeTeam, homeTeamFixtures);
			this.fixtureDifficulty.set(homeTeam, homeTeamDifficulty + fixture.team_h_difficulty);

			//away
			const awayTeamFixtures = this.teamFixturesAll.get(awayTeam) || [];
			let awayTeamDifficulty = this.fixtureDifficulty.get(awayTeam) || 0;
			awayTeamFixtures.push(awayFixure);

			this.fixtureDifficulty.set(awayTeam, awayTeamDifficulty + fixture.team_a_difficulty);
			this.teamFixturesAll.set(awayTeam, awayTeamFixtures);
		});

		this.teams = Array.from(this.teamFixturesAll.keys());
	}

	updateRank() {
		let teamfixtures = Array.from(this.teamFixturesAll);

		teamfixtures.map(([ team, fixures ]) => {
			const totalDifficulty = fixures.slice(0, this.fixtureRange).reduce((a, b) => {
				return a + b.difficulty;
			}, 0);

			this.fixtureDifficulty.set(team, totalDifficulty);
		});

		teamfixtures.sort(
			([ key1, value1 ], [ key2, value2 ]) => this.fixtureDifficulty.get(key1) - this.fixtureDifficulty.get(key2)
		);

		this.teamFixtures = new Map((teamfixtures as unknown) as ReadonlyArray<[any, any]>);
		this.teams = Array.from(this.teamFixtures.keys());
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
     * Get all the fixtures played this year
     */
	getFixtures() {
		return this.fplDataService.getData('https://fantasy.premierleague.com/drf/fixtures/');
	}
}
