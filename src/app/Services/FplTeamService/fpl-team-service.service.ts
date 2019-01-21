import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { FplDataService } from '../../Services/FplData/fpl-data.service';
import { StaticDataService } from '../../Services/StaticData/static.data.service';
import FantasyPlayer from 'src/app/Models/FantasyPlayer';
import Team from 'src/app/Models/Team';
import SoccerPlayer from 'src/app/Models/SoccerPlayer';
import { LiveDataService } from '../LiveData/live.data.service';

@Injectable({
	providedIn: 'root'
})
export class FplTeamService {
	currentGameweek: any;
	bootstrapData: any;
	liveData: any;
	constructor(
		private staticDataService: StaticDataService,
		private storage: Storage,
		private fplDataService: FplDataService,
		private liveDataService: LiveDataService
	) {
		this.init();
	}

	async init() {
		this.currentGameweek = await this.staticDataService.getCurrentGameweek();
	}

	async getCurrentGameweekData(id) {
		if (!this.currentGameweek) {
			this.bootstrapData = await this.staticDataService.getBootstrapData();
			this.currentGameweek = this.bootstrapData['current-event'];
			this.getDataAsyncOrRetrieveStored(
				id,
				this.composeCurrentGameweekInfoUrl(id, this.bootstrapData['current-event'])
			);
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
		]).then(async ([ gameweekData, gameweekHistory ]) => {
			this.liveData = await this.getLiveData();
			const leagues = gameweekHistory.leagues.classic;
			const firstName = gameweekHistory.entry.player_first_name;
			const lastName = gameweekHistory.entry.player_last_name;
			const country = this.createCountryPhotoUrl(gameweekHistory.entry.player_region_short_iso);
			const teamName = gameweekHistory.entry.name;
			const currentGameweek = gameweekHistory.entry.current_event;
			const lastWeekOverallPoints = gameweekHistory.history[gameweekHistory.history.length - 1].total_points;
			const picks = gameweekData.picks;
			const team = new Team(id, teamName, currentGameweek, [], lastWeekOverallPoints);
			const fantasyPlayer = new FantasyPlayer(id, leagues, `${firstName} ${lastName}`, team, country);

			//create team of players
			for (const pick of picks) {
				const player = this.bootstrapData.elements.find((player) => player.id === pick.element);
				const newPlayer = new SoccerPlayer(
					pick.element,
					player.web_name,
					this.getLivePoints(player.id),
					this.createPlayerPhotoUrl(player.photo),
					pick.position
				);
				fantasyPlayer.team.players.push(newPlayer);
			}
			console.log(gameweekData, gameweekHistory, this.liveData);

			return fantasyPlayer;
		});
	}

	getLivePoints(id) {
		console.log(this.liveData['elements'][id]['stats']['total_points']);
		return this.liveData['elements'][id]['stats']['total_points'];
	}
	async getLiveData() {
		return await this.liveDataService.getLiveData(this.currentGameweek);
	}

	createCountryPhotoUrl(code) {
		return `/assets/country_flags/${code}.gif`;
	}

	createPlayerPhotoUrl(photo) {
		return Team.composePhotoUrl(photo);
	}

	async getBootstrapData() {
		return this.fplDataService.getData('https://fantasy.premierleague.com/drf/bootstrap-static');
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
