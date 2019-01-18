import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { FplDataService } from '../../Services/FplData/fpl-data.service';
import { StaticDataService } from '../../Services/StaticData/static.data.service';

@Injectable({
	providedIn: 'root'
})
export class FplTeamServiceService {
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
	loadTeam(id) {
		Promise.all([
			this.getCurrentGameweekData(id),
			this.getPlayerGameweekHistory(id)
		]).then(([ gameweekData, gameweekHistory ]) => {});
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
