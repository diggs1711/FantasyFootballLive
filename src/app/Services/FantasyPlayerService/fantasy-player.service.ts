import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { StaticDataService } from '../StaticData/static.data.service';
import FantasyPlayer from 'src/app/Models/FantasyPlayer';
import Team from 'src/app/Models/Team';
import SoccerPlayer from 'src/app/Models/SoccerPlayer';
import { LiveDataService } from '../LiveData/live.data.service';
import { HttpRequestService } from '../HttpRequestService/http-request.service';

@Injectable({
	providedIn: 'root'
})
export class FantasyPlayerService {
	currentGameweek: any;
	bootstrapData: any;
	liveData: any;
	fantasyPlayerHistoryKey: string;

	constructor(
		private staticDataService: StaticDataService,
		private storage: Storage,
		private httpRequestService: HttpRequestService,
		private liveDataService: LiveDataService
	) {}

	async getCurrentGameweekData(id: number, gameweek: number) {
		const key = `current-gameweek-${id}-${gameweek}`;
		const stored = await this.storage.get(key);
		if (stored) return stored;

		const data = await this.httpRequestService
			.getData(this.composeCurrentGameweekInfoUrl(id, gameweek))
			.catch(() => undefined);
		this.storage.set(key, data);
		return data;
	}

	async getPlayerGameweekHistory(id: number, gameweek: number) {
		//use gameweek so it fetches new data when gameweek changes
		const key = `gameweek-history-${id}-${gameweek}`;
		const stored = await this.storage.get(key);
		if (stored) return stored;

		const data = await this.httpRequestService
			.getData(this.composePlayerGameweekHistoryUrl(id))
			.catch(() => undefined);
		this.storage.set(key, data);
		return data;
	}

	composePlayerGameweekHistoryUrl(playerId: any): any {
		return `https://fantasy.premierleague.com/drf/entry/${playerId}/history`;
	}

	/**
   * 
   * @param id fpl id from user input
   * @description get all data needed to display and current live score
   */
	async createPlayer(id: number, liveData: any): Promise<FantasyPlayer> {
		if (!this.currentGameweek) this.currentGameweek = await this.staticDataService.getCurrentGameweek();
		this.liveData = liveData;

		let [ gameweekData, gameweekHistory ] = await Promise.all([
			this.getCurrentGameweekData(id, this.currentGameweek).catch(() => undefined),
			this.getPlayerGameweekHistory(id, this.currentGameweek).catch(() => undefined)
		]);

		const leagues = gameweekHistory.leagues.classic;
		const firstName = gameweekHistory.entry.player_first_name;
		const lastName = gameweekHistory.entry.player_last_name;
		const country = this.createCountryPhotoUrl(gameweekHistory.entry.player_region_short_iso);
		const teamName = gameweekHistory.entry.name;
		const currentGameweek_1 = gameweekHistory.entry.current_event;
		const lastWeekOverallPoints = gameweekHistory.history.pop().total_points;
		const picks = gameweekData.picks;
		const team = new Team(id, teamName, currentGameweek_1, [], lastWeekOverallPoints);
		const gameweekTransfers = gameweekData.entry_history.event_transfers;
		const gameweekTransfersCost = gameweekData.entry_history.event_transfers_cost;
		const overallRank = gameweekHistory.history.pop().overall_rank;
		const fantasyPlayer = new FantasyPlayer(
			id,
			leagues,
			`${firstName} ${lastName}`,
			team,
			country,
			overallRank,
			gameweekTransfers
		);
		//create team of players
		for (const pick of picks) {
			const player = this.staticDataService.data.elements.find((player_1) => player_1.id === pick.element);
			const position = this.getElementType(player.element_type);
			const newPlayer = new SoccerPlayer(
				pick.element,
				player.web_name,
				this.getLivePoints(player.id),
				this.createPlayerPhotoUrl(player.photo),
				pick.position,
				position,
				player.element_type
			);
			newPlayer.isCaptain = pick.is_captain;
			newPlayer.multiplier = pick.multiplier;
			fantasyPlayer.team.players.push(newPlayer);
			this.addPlayersToPositions(pick, fantasyPlayer, newPlayer, position);
		}
		for (const player of fantasyPlayer.team.players) {
			if (player.teamPosition < 12) {
				fantasyPlayer.team.gameweekPoints += player.gameweek_points * player.multiplier;
			}

			if (player.isCaptain) fantasyPlayer.team.captain = player.name;
		}
		fantasyPlayer.gameweekTransfersCost = gameweekTransfersCost;
		fantasyPlayer.team.overallPoints =
			lastWeekOverallPoints + fantasyPlayer.team.gameweekPoints - gameweekTransfersCost;
		return fantasyPlayer;
	}

	addPlayersToPositions(pick, fantasyPlayer, newPlayer, position) {
		//addd starters to positions array to display on team page
		if (pick.position < 12) {
			fantasyPlayer.team[`${position}s`].push(newPlayer);
		} else {
			fantasyPlayer.team.Bench.push(newPlayer);
		}
	}

	getElementType(typeId) {
		return this.staticDataService.data.element_types.find((type) => type.id == typeId).singular_name;
	}

	getLivePoints(id) {
		return this.liveData['elements'][id]['stats']['total_points'];
	}
	async getLiveData(gameweek: number) {
		return await this.liveDataService.getLiveData(gameweek);
	}

	createCountryPhotoUrl(code) {
		return `/assets/country_flags/${code}.gif`;
	}

	createPlayerPhotoUrl(photo) {
		return Team.composePhotoUrl(photo);
	}

	async getDataAsyncOrRetrieveStored(id, url) {
		let key = '';
		const userkey = `${key}-${id}`;
		const storedData = await this.storage.get(userkey);

		if (!storedData) {
			const data = await this.httpRequestService.getData(url);
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
