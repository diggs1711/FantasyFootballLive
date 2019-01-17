import { Injectable } from '@angular/core';
import { FplDataService } from '../FplData/fpl-data.service';

@Injectable({
	providedIn: 'root'
})
export class StaticDataService {
	soccerPlayers: any;
	currentGameweek: Number;
	positions: any;
	teams: any;

	constructor(private fplDataService: FplDataService) {}

	/**
	 * @Returns returns a promise containing bootstrap data
	 * @description returns current gameweek, soccer player data, prem team data, next gw fixtures
	 */

	async getBootstrapData() {
		return await this.fplDataService
			.getData('https://fantasy.premierleague.com/drf/bootstrap-static')
			.then((bootstrap) => {
				const {
					'current-event': currentGameweek,
					elements: soccerPlayers,
					element_types: positions,
					teams: teams
				} = bootstrap;

				this.soccerPlayers = soccerPlayers;
				this.currentGameweek = currentGameweek;
				this.positions = positions;
				this.teams = teams;
			});
	}

	/**
   * @description check if data is present
   */
	isDataLoaded() {
		return this.currentGameweek > 0;
	}

	getCurrentGameweek() {
		return this.currentGameweek;
	}

	getSoccerPlayers() {
		return this.soccerPlayers;
	}

	getPositions() {
		return this.positions;
	}

	getTeams() {
		return this.teams;
	}
}
