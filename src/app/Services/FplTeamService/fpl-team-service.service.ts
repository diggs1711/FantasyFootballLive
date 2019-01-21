import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { FplDataService } from '../../Services/FplData/fpl-data.service';
import { StaticDataService } from '../../Services/StaticData/static.data.service';
import FantasyPlayer from 'src/app/Models/FantasyPlayer';
import Team from 'src/app/Models/Team';

@Injectable({
	providedIn: 'root'
})
export class FplTeamService {
	currentGameweek: any;
	constructor(
		private staticDataService: StaticDataService,
		private storage: Storage,
		private fplDataService: FplDataService
	) {
		this.init();
	}

	async init() {
		this.currentGameweek = await this.staticDataService.getCurrentGameweek();
	}

	async getCurrentGameweekData(id) {
		if (!this.currentGameweek) {
			return this.staticDataService.getCurrentGameweek().then((gameweek) => {
				return this.getDataAsyncOrRetrieveStored(id, this.composeCurrentGameweekInfoUrl(id, gameweek));
			});
		}

		return this.getDataAsyncOrRetrieveStored(id, this.composeCurrentGameweekInfoUrl(id, this.currentGameweek));
	}

	async getTeam(id) {
		return await this.storage.get(`team-${id}`).then((team) => {
			//if team is stored return it
			if (team) return team;

			return this.loadPlayer(id);
		});
	}

	getPlayerGameweekHistory(id) {
		return this.getDataAsyncOrRetrieveStored(id, this.composePlayerGameweekHistoryUrl(id));
	}

	composePlayerGameweekHistoryUrl(playerId: any): any {
		return `https://fantasy.premierleague.com/drf/entry/${playerId}/history`;
	}

	/**
   * 
   * @param id fpl id from user input
   * @description get all data needed to display and current live score
   */
	async loadPlayer(id) {
		return await Promise.all([
			this.getCurrentGameweekData(id),
			this.getPlayerGameweekHistory(id)
		]).then(([ gameweekData, gameweekHistory ]) => {
			const leagues = gameweekHistory.leagues.classic;
			const firstName = gameweekHistory.entry.player_first_name;
			const lastName = gameweekHistory.entry.player_last_name;
			const country = gameweekHistory.entry.player_region_short_iso;
			const teamName = gameweekHistory.entry.name;
			const currentGameweek = gameweekHistory.entry.current_event;
			const lastWeekOverallPoints = gameweekHistory.history[gameweekHistory.history.length - 1].total_points;

			const team = new Team(id, teamName, currentGameweek, [], lastWeekOverallPoints);

			const fantasyPlayer = new FantasyPlayer(id, leagues, `${firstName} ${lastName}`, team, country);
			console.log(gameweekData, gameweekHistory);

			return fantasyPlayer;
		});
	}

	async getDataAsyncOrRetrieveStored(id, url) {
		let key = '';
		const userkey = `${key}-${id}`;
		const storedData = await this.storage.get(userkey);

		if (!storedData) {
			const data = await this.fplDataService.getData(url);
			//this.storage.set(userkey, data);
			return data;
		}
		return storedData;
	}

	/**
	 * 	
	 * @param playerId id
	 * @param currentGameweek current gameweek
	 * @description formats the url correctly for each player
	 */
	composeCurrentGameweekInfoUrl(playerId: any, currentGameweek: any): any {
		return `https://fantasy.premierleague.com/drf/entry/${playerId}/event/${currentGameweek}/picks`;
	}
}
